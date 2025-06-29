'server-only';
import { eq, lt, gte, ne, like, or, ilike, and, notInArray } from 'drizzle-orm';
import { db } from '..';
// import { linkUserFollow } from '../schema/link';
import {  user_table,  idCardInfo_table } from '../schema/user';
import type { User } from '../schema/user';
import { hash_password } from '~/lib/core/auth';
import { friend_table } from '../schema/follow';
import { friendIdList_byUserId } from './user/friend';
import { SelectedFields } from 'drizzle-orm/pg-core';


// 定义新的输入类型，包含关系字段，并将 name 和 password 设为必选字段
type CreateUserInput = Omit<Partial<User>, 'name' | 'password'> & {
  name: string;
  password: string;
  idCardInfo: {
    id_card_number: string;
    idCardHolder?: string; // self | guardian
    // isRealName?: boolean; // 这个字段不由用户填写
    frontImageUrl?: string;
    backImageUrl?: string;
  };
};
type CreateUserOutput = User & { idCardInfo?: typeof idCardInfo_table.$inferInsert };
// 创建user
export async function create(new_user: CreateUserInput): Promise<CreateUserOutput> {
// export async function create(new_user) {
  if (!new_user.name || !new_user.password) {
    throw new Error('Name and password are required');
  }
  // 如果没有 image， image 默认为 `https://avatar.vercel.sh/${name}`
  if (!new_user.image) {
    new_user.image = `https://avatar.vercel.sh/${new_user
      .name}`;
  }
  // const user: typeof user_table.$inferInsert = new_user
  const user: typeof user_table.$inferInsert = {
    name: new_user.name,
    image: new_user.image,
    nickname: new_user.nickname,
    phone: new_user.phone,
    gender: new_user.gender,
    age: new_user.age,
    email: new_user.email,
    password: new_user.password,
    platform_info: new_user.platform_info,
  };
  const [dbUser] = await db.insert(user_table).values(user).returning()

  let dbIdCardInfo;
  if (new_user.idCardInfo) {
    const idCardInfo = {
      ...new_user.idCardInfo,
      userId: dbUser.id,
    };
    [dbIdCardInfo] = await db.insert(idCardInfo_table).values(idCardInfo).returning();
  }
  return {
    ...dbUser,
    idCardInfo: dbIdCardInfo,
  }
}

export const userList_byWord = async (keyword: string, offset: number = 0, limit: number = 10): Promise<User[]> => {
  const users = await db
  .select()
  .from(user_table)
  .where(or(
    ilike(user_table.name, `%${keyword}%`),
    ilike(user_table.email, `%${keyword}%`),
    ilike(user_table.phone, `%${keyword}%`),
    ilike(user_table.nickname, `%${keyword}%`)
  )).offset(offset).limit(limit)

  return users;
}

export const userList_onlyNotFriend_byWord_currentUserId = async (currentUserId: string, keyword: string, offset: number = 0, limit: number = 10): Promise<User[]> => {
  // 获取当前用户的好友列表
  const friendIds = await friendIdList_byUserId(currentUserId);

  // 查询不在好友列表中的用户
  const users = await db
    .select()
    .from(user_table)
    .where(
      and(
        or(
          ilike(user_table.name, `%${keyword}%`),
          ilike(user_table.email, `%${keyword}%`),
          ilike(user_table.phone, `%${keyword}%`),
          ilike(user_table.nickname, `%${keyword}%`)
        ),
        notInArray(user_table.id, friendIds)
      )
    ).offset(offset).limit(limit)
  return users;
}


export const getByName = async (name: string) => {
  const users = await db.select().from(user_table).where(eq(user_table.name, name));
  return users
}

export const getMetaByName = async (name: string) => {
  const [user] = await db.select({id: user_table.id,
    name: user_table.name,
    email: user_table.email,
    image: user_table.image,
    nickname: user_table.nickname,
    status: user_table.status,}).from(user_table).where(eq(user_table.name, name));
  return user
}

export const updatePassword = async (name: string, hashPassword: string) => {
  const result = await db.update(user_table).set({ password: hashPassword }).where(eq(user_table.name, name));
  return result;
}

export const updatePassword_withHash = async (name: string, newPassword: string) => {
  const hashPassword = await hash_password(newPassword);
  return updatePassword(name, hashPassword);
}
