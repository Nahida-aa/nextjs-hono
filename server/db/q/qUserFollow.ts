'server-only';
import { eq, lt, gte, ne, sql, and, or } from 'drizzle-orm';
import { db } from '..';
// import { linkUserFollow } from '../schema/link';
import { user_table } from '../schema/user';

// export async function getUserFollowers(user_id: string) {
//   const followers = await db
//     .select({
//       followerId: linkUserFollow.user_id,
//       follower: userTable,
//     })
//     .from(linkUserFollow)
//     .leftJoin(userTable, eq(linkUserFollow.user_id, userTable.id))
//     // .innerJoin(user, linkUserFollow.user_id.eq(user.id))
//     // .where(linkUserFollow.target_user_id.eq(user_id))
//     .where(eq(linkUserFollow.target_user_id, user_id))
//     // .all();

//   return followers;
// }

// export class QLinkUserFollow {
//   // 返回当目标户关注的用户(团队)list, 每个用户携带与当前用户的关注关系(两个字段: 1. 当前用户是否关注了目标用户的关注的用户; 2. 目标用户关注的用户是否关注了当前用户)
//   static async getFollowingByIds(current_user_id: string, target_user_id: string) {
//     const subquery = db
//       .select({
//         followedId: linkUserFollow.target_user_id,
//         currentFollowingUser: sql<boolean>`CASE WHEN ${linkUserFollow.user_id} = ${current_user_id} THEN true ELSE false END`,
//         userFollowingCurrent: sql<boolean>`CASE WHEN ${linkUserFollow.target_user_id} = ${current_user_id} THEN true ELSE false END`,
//       })
//       .from(linkUserFollow)
//       .where(or(
//         eq(linkUserFollow.user_id, current_user_id),
//         eq(linkUserFollow.target_user_id, current_user_id)
//       ))
//       .as('subquery');

//     const result = await db
//       .select({
//         user: userTable,
//         currentFollowingUser: subquery.currentFollowingUser,
//         userFollowingCurrent: subquery.userFollowingCurrent,
//       })
//       .from(linkUserFollow)
//       .innerJoin(userTable, eq(linkUserFollow.target_user_id, userTable.id))
//       .leftJoin(subquery, eq(subquery.followedId, userTable.id))
//       .where(eq(linkUserFollow.user_id, target_user_id))
//       .orderBy(userTable.name);

//     return result.map(row => ({
//       ...row.user,
//       currentFollowingUser: row.currentFollowingUser ?? false,
//       userFollowingCurrent: row.userFollowingCurrent ?? false,
//     }));

//   }

//   static async getByIds(current_user_id: string, target_user_id: string) {
//     const [dbLinkUserFollow] = await db.select()
//       .from(linkUserFollow)
//       .where(
//         sql`(${linkUserFollow.user_id} = ${current_user_id}) and (${linkUserFollow.target_user_id} = ${target_user_id})`
//       )
//     return dbLinkUserFollow
//   }

//   static async create(current_user_id: string, target_user_id: string) {
//     const [dbLinkUserFollow] = await db.insert(linkUserFollow)
//       .values({
//         user_id: current_user_id,
//         target_user_id,
//       })
//       .returning()
//     return dbLinkUserFollow
//   }

//   static async followUserByIds(current_user_id: string, target_user_id: string) {//业务逻辑: 当前用户关注目标用户
//     // 检查是否已经关注
//     const dbLinkUserFollow = await this.getByIds(current_user_id, target_user_id)
//     if (dbLinkUserFollow) {
//       throw new Error('User is already following the target user');
//     }
    
//     // 使用事务来确保所有更新都成功完成或全部回滚
//     return await db.transaction(async (tx) => {
//       console.log('followUserByIds::transaction 开始', current_user_id, target_user_id);
//       // 创建关注 link
//       const [newLinkUserFollow] = await tx.insert(linkUserFollow)
//         .values({
//           user_id: current_user_id,
//           target_user_id,
//         })
//         .returning();

//       // 更新目标用户的粉丝数并返回更新后的用户数据
//       const [updatedTargetUser] = await tx.update(userTable)
//         .set({
//           followers_count: sql`${userTable.followers_count} + 1`,
//         })
//         .where(eq(userTable.id, target_user_id))
//         .returning();

//       // 更新当前用户的关注人数并返回更新后的用户数据
//       const [updatedCurrentUser] = await tx.update(userTable)
//         .set({
//           following_count: sql`${userTable.following_count} + 1`,
//         })
//         .where(eq(userTable.id, current_user_id))
//         .returning();

//       return {
//         linkUserFollow: newLinkUserFollow,
//         currentUser: updatedCurrentUser,
//         targetUser: updatedTargetUser
//       };
//     });
//   }

//   static async followUserByNames(currentUserName: string, targetUserName: string) {
//     console.log('followUserByNames:', currentUserName, targetUserName);
//     const [{id: current_user_id }] = await db.select({id: userTable.id})
//       .from(userTable)
//       .where(eq(userTable.name, currentUserName))

//     const [{id: target_user_id}] = await db.select({id: userTable.id})
//       .from(userTable)
//       .where(eq(userTable.name, targetUserName))

//     if (!current_user_id || !target_user_id) {
//       throw new Error('User not found');
//     }

//     return this.followUserByIds(current_user_id, target_user_id);
//   }
// }