import { db } from "~/lib/db";
import { friend_table } from "~/lib/db/schema/follow";
import { friendNotification_table } from "~/lib/db/schema/notification";
import { eq, and, or, inArray, ilike, notInArray, not } from "drizzle-orm";
import { chat_table, link_chat_user_table } from "../../schema/message";
import { user, User, user_table } from "../../schema/user";
import { z } from "@hono/zod-openapi";
import { createChat, getUserChat } from "./chat";

// 检查是否已经存在好友请求或好友关系
export const getFriendship = async (sender_id: string, receiver_id: string) => {
  console.log('getFriendship. sender_id:', sender_id, 'receiver_id:', receiver_id)
  const [friendship] = await db.select({
    user_id: friend_table.user_id,
  }).from(friend_table)
    .where(and(eq(friend_table.user_id, sender_id),
      eq(friend_table.friend_id, receiver_id)));
  console.log('friendship.return', friendship)
  return friendship
}

// 创建好友请求
export const createFriendRequest = async (sender_id: string, receiver_id: string, content: string) => {
  console.log('sender_id:', sender_id, 'receiver_id:', receiver_id, 'content:', content)
  return await db.transaction(async (tx) => {
    // 创建好友请求通知
    const [notification] = await tx.insert(friendNotification_table).values({
      status: 'pending',
      content: content,
      receiver_id: receiver_id,
      sender_id: sender_id,
    }).returning();

    return notification;
  });
}


// 接受好友请求
export async function acceptFriendRequest(notification_id: string,
  sender_id: string, receiver_id: string, content: string) {
  return await db.transaction(async (tx) => {
    // 创建好友关系
    await tx.insert(friend_table).values([{
        user_id: receiver_id,
        friend_id: sender_id,
      }, {
        user_id: sender_id,
        friend_id: receiver_id,
      }]);
    // 更新好友请求通知状态
    await tx.update(friendNotification_table)
      .set({ status: 'accepted' })
      .where(eq(friendNotification_table.id, notification_id));

    // 检查是否已经存在私聊的 Chat 记录
    let chat = await getUserChat(sender_id, receiver_id);

    // 自动创建一个 Chat 记录
    if (!chat) {
      await createChat('user', [sender_id, receiver_id], content);
    }
    return 
  });
}

// 拒绝好友请求
export async function rejectFriendRequest(sender_id: string, receiver_id: string) {
  return await db.transaction(async (tx) => {
    // 创建拒绝好友请求通知
    const [notification] = await tx.insert(friendNotification_table).values({
      status: 'reject',
      content: '好友请求已拒绝',
      receiver_id: sender_id,
      sender_id: receiver_id,
    }).returning();

    return notification;
  });
}

export const friendIdList_byUserId = async (user_id: string): Promise<string[]> => {
  const friends = await db.select({ friend_id: friend_table.friend_id })
    .from(friend_table)
    .where(eq(friend_table.user_id, user_id))

  return friends.map(friend => friend.friend_id);
}

export const userList_isFriend_byUserId = async (user_id: string, offset: number = 0, limit: number = 10) => {
  const friendIds = await friendIdList_byUserId(user_id);

  const users = await db.select().from(user_table)
    .where(inArray(user_table.id, friendIds))
    .offset(offset).limit(limit)

  return users;
}

export const userLsWithCount_isFriend_by_currentUserId = async (user_id: string, offset: number = 0, limit: number = 10) => {
  const friendIds = await friendIdList_byUserId(user_id);

  const usersQuery = db.select().from(user_table)
    .where(inArray(user_table.id, friendIds))

  const count = (await usersQuery).length
  const users = await usersQuery.offset(offset).limit(limit);

  return { users, count };
}
export type UserLsWithCount = Awaited<ReturnType<typeof userLsWithCount_isFriend_by_currentUserId>>

// 定义 User 的 zod 模式
const UserSchema_whenAddFriend = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  nickname: z.string().nullable(),
  image: z.string().nullable(),
  description: z.string().nullable(),
  gender: z.string().nullable(),
  age: z.number().nullable(),
});
// 定义 UserLsWithCount 的 zod 模式
export const UserLsWithCountSchema_whenAddFriend = z.object({
  users: z.array(UserSchema_whenAddFriend),
  count: z.number(),
});
export type UserLsWithCount_whenAddFriend = z.infer<typeof UserLsWithCountSchema_whenAddFriend>
export type User_whenAddFriend = z.infer<typeof UserSchema_whenAddFriend>

export const userLsWithCount_notFriend_by_currentUserId_word = async (currentUserId: string, keyword: string, offset: number = 0, limit: number = 10)
: Promise<UserLsWithCount_whenAddFriend> => {
  // 获取当前用户的好友列表
  const friendIds = await friendIdList_byUserId(currentUserId);

  // 查询不在好友列表中的用户
  const usersQuery = db.select({
    id: user_table.id,
    name: user_table.name,
    email: user_table.email,
    phone: user_table.phone,
    nickname: user_table.nickname,
    image: user_table.image,
    description: user_table.description,
    gender: user_table.gender,
    age: user_table.age,
  }).from(user_table)
    .where(and(
      not(eq(user_table.id, currentUserId)), // 排除当前用户
      notInArray(user_table.id, friendIds),
      or(
        ilike(user_table.name, `%${keyword}%`),
        ilike(user_table.email, `%${keyword}%`),
        ilike(user_table.phone, `%${keyword}%`),
        ilike(user_table.nickname, `%${keyword}%`)
      ),
    ));
  const count = (await usersQuery).length
  const users = await usersQuery.offset(offset).limit(limit).execute()
  return { users, count };
}