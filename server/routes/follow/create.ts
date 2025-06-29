import { createRouter } from "~/lib/create-app";
import { get_current_user_and_res, get_session_token_payload, get_session_token_payload_and_res, SessionTokenPayload } from "~/lib/middleware/auth";
import NameParamsSchema, { UsernameParamsSchema } from "~/lib/openapi/schemas/name-params";
import { createRoute } from "@hono/zod-openapi";
import httpStatus from "~/lib/http-status-codes"
import { db } from "~/lib/db";
import { eq, sql } from "drizzle-orm";
import { user_table } from "~/lib/db/schema/user";
import { group_table } from "~/lib/db/schema/group";
import { follow_table } from "~/lib/db/schema/follow";
import { StatusCode } from "hono/utils/http-status";

const router = createRouter()

router.openapi(createRoute({
  tags: ["follow"],
  description: `Follow a user`,
  path: "/user/follow/{name}",
  method: "post",
  request: {
    params: NameParamsSchema
  },
  responses: {
    [httpStatus.NO_CONTENT]: {
      description: "No content"
    }
  }
}), async (c) => {
  const current_user_ret = await get_current_user_and_res(c)
  if (!current_user_ret.success) return c.json(current_user_ret.json_body, current_user_ret.status)
  const current_user = current_user_ret.user

  const { name } = c.req.valid("param")
  console.log('name:', name)
  // follow user
  const { message, success, status } = await follow_a_user(name, current_user)
  if (!success) return c.json({ message }, status as StatusCode)
  return c.json(undefined,httpStatus.NO_CONTENT)
})

async function follow_a_user(user_name: string, follower_user: { id: string, name: string }): Promise<{ message: string, success: boolean, status: number }> {
  // 同名用户不能关注
  if (user_name === follower_user.name) return { message: `不能关注自己`, success: false, status: httpStatus.BAD_REQUEST }

  // 查询用户是否存在
  const target_user = await db.query.user_table.findFirst({ where: eq(user_table.name, user_name) })
  if (!target_user) return { message: `用户 ${user_name} 不存在`, success: false, status: httpStatus.NOT_FOUND }

  // 查询是否已经关注
  const follow = await db.select().from(follow_table).where(
    sql`${follow_table.follower_id} = ${follower_user.id} and ${follow_table.target_id} = ${target_user.id}`)
  if (follow.length > 0) return { message: `${follower_user.name}已经关注 ${user_name}`, success: false, status: httpStatus.BAD_REQUEST }

  // 关注事务
  await db.transaction(async (tx) => {
    await tx.insert(follow_table).values({
      follower_id: follower_user.id,
      target_id: target_user.id,
      target_type: 'user'
    }).execute()
    // 被关注用户的粉丝数加1
    await tx.update(user_table).set({ 
      followers_count: sql`${user_table.followers_count}+1`,
    }).where(eq(user_table.id, target_user.id)).execute()
    // 用户的关注数加1
    await tx.update(user_table).set({ 
      following_count: sql`${user_table.following_count}+1`,
    }).where(eq(user_table.id, follower_user.id)).execute()
  })
  return { message: `followed ${user_name}` , success: true, status: httpStatus.NO_CONTENT }
}

router.openapi(createRoute({
  tags: ["follow"],
  description: `Follow a group`,
  path: "/user/follow/group/{name}",
  method: "post",
  request: {
    params: NameParamsSchema
  },
  responses: {
    [httpStatus.NO_CONTENT]: {
      description: "No content"
    }
  }
}), async (c) => {
  const current_user_ret = await get_current_user_and_res(c)
  if (!current_user_ret.success) return c.json(current_user_ret.json_body, current_user_ret.status)
  const current_user = current_user_ret.user

  const { name } = c.req.valid("param")
  // follow group
  const { message, success, status } = await follow_a_group(name, current_user)
  if (!success) return c.json({ message }, status as StatusCode)
  return c.json(undefined,httpStatus.NO_CONTENT)
})

// TODO: 目标是将 follower_id 和 target_id 作为联合主键, 我感觉可能会冲突, 应该再加上 target_type, 不过另外一方面我设计的 user 和 group 的 name 是唯一的, 所以 可以考虑不用 id 作为主键
export async function follow_a_group(group_name: string, follower_user: { id: string, name: string }): Promise<{ message: string, success: boolean, status: number }> {
  // 查询group是否存在
  const target_group = await db.query.group_table.findFirst({ where: eq(user_table.name, group_name) })
  if (!target_group) return { message: `group: ${group_name} 不存在`, success: false, status: httpStatus.NOT_FOUND }

  // 查询是否已经关注
  const follow = await db.select().from(follow_table).where(
    sql`${follow_table.follower_id} = ${follower_user.id} and ${follow_table.target_id} = ${target_group.id}`)
  if (follow.length > 0) return { message: `${follower_user.name}已经关注 ${group_name}`, success: false, status: httpStatus.BAD_REQUEST }

  // 关注事务
  await db.transaction(async (tx) => {
    await tx.insert(follow_table).values({
      follower_id: follower_user.id,
      target_id: target_group.id,
      target_type: 'group'
    }).execute()
    // 被关注 group 的粉丝数加1
    await tx.update(group_table).set({ 
      followers_count: sql`${group_table.followers_count}+1`,
    }).where(eq(group_table.id, target_group.id)).execute()
    // 用户的关注数加1
    await tx.update(user_table).set({ 
      following_count: sql`${user_table.following_count}+1`,
    }).where(eq(user_table.id, follower_user.id)).execute()
  })
  return { message: `followed ${group_name}` , success: true, status: httpStatus.NO_CONTENT }
}

export default router