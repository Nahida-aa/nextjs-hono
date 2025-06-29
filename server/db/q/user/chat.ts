import { db } from "~/lib/db";
import { chat_table, link_chat_user_table } from "~/lib/db/schema/message";
import { user_table } from "~/lib/db/schema/user";
import { eq, and, inArray, aliasedTable, or, not, InferSelectModel, sql } from "drizzle-orm";
import { group_table } from "../../schema/group";

export interface Chat {
  id: string;
  latest_message: string;
  latest_message_count: number;
  latest_sender_type: string;
  latest_message_timestamp: Date;
  latest_sender_id: string;
  created_at: Date;
  type: string; // 'user' 或 'group'
  group_id: string | null;
}
export interface ChatTargetUser {
  id: string;
  name: string;
  nickname: string | null;
  image: string;
}
export interface ChatTargetGroup {
  id: string;
  name: string;
  image: string;
  members: {
    id: string;
    name: string;
    image: string;
  }[];
}
export interface ChatWithTarget {
  chat: Chat;
  is_pinned: boolean | null;
  target_user: ChatTargetUser | null;
  target_group: ChatTargetGroup | null;
  latest_sender: ChatTargetUser | null;
}

export type ChatsWithCount = Awaited<ReturnType<typeof listChat_by_userId>>
// 返回用户聊天列表的函数
export async function listChat_by_userId(currentUser_id: string, 
  offset: number = 0, limit: number=10
) {
  try {
    const latestSender_table = aliasedTable(user_table, "latestSender_table")
    // const groupMembers_table = aliasedTable(user_table, "groupMembers_table");

    const chatsQ = db.select({ 
      chat: chat_table,
      is_pinned: link_chat_user_table.is_pinned,
      target_user: {
        id: user_table.id,
        name: user_table.name,
        nickname: user_table.nickname,
        image: user_table.image,
      },
      target_group: {
        id: group_table.id,
        name: group_table.name,
        image: group_table.image,
        members: sql`array(
          select jsonb_build_object(
            'id', ${user_table.id},
            'name', ${user_table.name},
            'image', ${user_table.image}
          )
          from ${link_chat_user_table}
          left join ${user_table} on ${link_chat_user_table.user_id} = ${user_table.id}
          where ${link_chat_user_table.chat_id} = ${chat_table.id}
          limit 4
        )`.as('members')
      },
      latest_sender: {
        id: latestSender_table.id,
        name: latestSender_table.name,
        nickname: latestSender_table.nickname,
        image: latestSender_table.image,
      }
    }).from(chat_table)
    .leftJoin(link_chat_user_table, eq(chat_table.id, link_chat_user_table.chat_id))
    .leftJoin(user_table, eq(link_chat_user_table.target_user_id, user_table.id))
    .leftJoin(group_table, eq(link_chat_user_table.target_group_id, group_table.id))
    .leftJoin(latestSender_table, eq(chat_table.latest_sender_id, latestSender_table.id))
    .where(eq(link_chat_user_table.user_id, currentUser_id))
    .orderBy(chat_table.latest_message_timestamp)

    const count = (await chatsQ).length
    const chats = await chatsQ.offset(offset).limit(limit) as ChatWithTarget[]

    return { items: chats, count }
  } catch (error) {
    console.error('Error in userChat_list:', error);
    throw error;
  }
}

export const getUserChat = async (user1_id: string, user2_id: string) => {
  const [chat] = await db.select().from(chat_table)
    .where(and(
      eq(chat_table.type, 'user'), // 确保是私聊
      inArray(chat_table.id, 
        db.select({chat_id: link_chat_user_table.chat_id})
          .from(link_chat_user_table)
          .where(eq(link_chat_user_table.user_id, user1_id))
      ),
      inArray(chat_table.id, 
        db.select({chat_id: link_chat_user_table.chat_id})
          .from(link_chat_user_table)
          .where(eq(link_chat_user_table.user_id, user2_id))
      )
    ))
    .limit(1);

  return chat;
}
export const getSelfChat = async (user_id: string): Promise<Chat_db | null> => {
  const [chat] = await db.select().from(chat_table)
    .where(and(
      eq(chat_table.type, 'self'), // 确保是自聊
      inArray(chat_table.id, 
        db.select({chat_id: link_chat_user_table.chat_id})
          .from(link_chat_user_table)
          .where(eq(link_chat_user_table.user_id, user_id))
      )
    ))
    .limit(1);

  return chat || null;
}

export const createChat = async (
  type: string, 
  user_ids: string[],
  content?: string,
  group_id?: string,
) => {
  return await db.transaction(async (tx) => {
    console.log('createChat', type, user_ids, content, group_id)
    console.log('latest_sender_id: ', user_ids[user_ids.length - 1])
    
    // TODO
    const [chat] = await tx.insert(chat_table).values({
      type: type,
      latest_message: content,
      latest_message_count: 1,
      latest_sender_type: 'system',
      latest_message_timestamp: sql`now()`,
      latest_sender_id: user_ids[user_ids.length - 1],
      group_id: group_id,
    }).returning();

    if (user_ids) {
      if (type === 'group') {
        await tx.insert(link_chat_user_table).values(
          user_ids.map((user_id) => ({
            chat_id: chat.id,
            user_id: user_id,
            target_group_id: group_id,
          }))
        );
      } else if (type === 'user') {
        await tx.insert(link_chat_user_table).values(
          user_ids.map((user_id) => ({
            chat_id: chat.id,
            user_id: user_id,
            target_user_id: user_ids.find(id => id !== user_id),
          }))
        );
      } else if (type === 'self') {
        await tx.insert(link_chat_user_table).values({
          chat_id: chat.id,
          user_id: user_ids[0],
          target_user_id: user_ids[0],
        });
      }
    }

    return chat;
  });
}

export type Chat_db = InferSelectModel<typeof chat_table>;
// 抽取出 检查and创建聊天的逻辑 (only for user chat)
export async function getOrCreateChat( // 针对userChat 包括 selfChat
  sender_id: string, 
  target_id: string, 
  content?: string,
): Promise<Chat_db> {
  // 提前判断是否为自聊
  if (sender_id === target_id) {
    let chat = await getSelfChat(target_id);
    if (chat) return chat;
    return await createChat('self', [sender_id], content);
  }

  // 如果不是自聊，继续查找或创建私聊
  let chat = await getUserChat(sender_id, target_id);
  if (chat) return chat;
  
  return await createChat('user', [target_id, sender_id], content);
}

// export type GetChatRet = Awaited<ReturnType<typeof getChat>>
// 获取特定用户和目标之间的聊天会话
export const getChat = async(user_id: string, target_id: string, target_type: string, //'user' | 'group'
) => {
  const [chat] = await db.select({
    id: chat_table.id,
    latest_message: chat_table.latest_message,
    latest_message_timestamp: chat_table.latest_message_timestamp,
    latest_sender_id: chat_table.latest_sender_id,
    created_at: chat_table.created_at,
    type: chat_table.type,
    group_id: chat_table.group_id,
  }).from(chat_table)
    .leftJoin(link_chat_user_table, eq(chat_table.id, link_chat_user_table.chat_id))
    .where(and(
      // eq(chat_table.type, target_type),
      eq(link_chat_user_table.user_id, user_id),
      target_type === 'user'
        ? eq(link_chat_user_table.target_user_id, target_id)
        : eq(link_chat_user_table.target_group_id, target_id)
    ))
    .limit(1);

  return chat // TYPE: 有可能返回 undefined, 需要在调用时处理
}

export type ChatForDB = InferSelectModel<typeof chat_table>;
