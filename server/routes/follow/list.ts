import { db } from "~/lib/db";
import { eq, sql, and, getTableColumns } from "drizzle-orm";
import { follow_table } from "~/lib/db/schema/follow";
import { createRouter } from "~/lib/create-app";
import NameParamsSchema from "~/lib/openapi/schemas/name-params";
import { createRoute, z } from "@hono/zod-openapi";
import { user_table } from "~/lib/db/schema/user";
import { group_table } from "~/lib/db/schema/group";
import { offset_limit_query_schema } from "~/lib/schema/query";
import { get_current_user_and_res } from "~/lib/middleware/auth";
import jsonContent from "~/lib/openapi/helpers/json-content";
import { user_meta_schema } from "~/lib/schema/user";

export const group_meta_schema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
})

export const follow_list_with_group_out_schema = z.object({
  followers: z.array(
    z.object({
      created_at: z.string(),
      type: z.enum(['user', 'group']),
      user: user_meta_schema.optional(),
      group: group_meta_schema.optional(),
      is_following: z.boolean(),
      is_following_me: z.boolean(),
    })
  ),
  count: z.number()
})

const router = createRouter()

router.openapi(createRoute({
  tags: ["follow"],
  description: `列出 user 的关注者(粉丝)
  - 注意粉丝只可能是 user, 不可能是 group`,
  path: "/users/{name}/followers",
  method: "get",
  request: {
    params: NameParamsSchema,
    query: offset_limit_query_schema,
  },
  responses: {
    [200]: jsonContent(z.object({
      followers: z.array(user_meta_schema),
      count: z.number()}), "返回 user 的关注者(粉丝)列表"),
    [404]: jsonContent(z.object({message: z.string()}), "用户不存在")
  }
}), async (c) => {
  const [{name}, {offset, limit}] = [c.req.valid("param"), c.req.valid("query")]
  // 查询 user
  const user = await db.query.user_table.findFirst({ where: eq(user_table.name, name) })
  if (!user) return c.json({ message: `用户 ${name} 不存在` }, 404)
  // 查询 user 的关注者(粉丝)
  const followers = await db.select().from(follow_table)
    .leftJoin(user_table, eq(follow_table.follower_id, user_table.id))
    .where(and(eq(follow_table.target_id, user.id), eq(follow_table.target_type, 'user'))).offset(offset).limit(limit)
  const [{count}] = await db.execute(sql`SELECT COUNT(*) FROM ${follow_table} WHERE ${follow_table.target_id} = ${user.id}`)
  console.log('followers:', followers)
  return c.json({followers: followers, count: count})
})
router.openapi(
  createRoute({
    tags: ["follow"], description: `返回 user 的关注者(粉丝)列表\n
    - 携带 粉丝 与 auth user 的关注关系
    - is_following_me: people是否关注 当前用户
    - me_is_following_him: 当前用户是否关注 people`,
    method: "get", path: "/user/{name}/followers",
    request: {
      params: NameParamsSchema,
      query: offset_limit_query_schema,
    },
    responses: {
      [200]: jsonContent(follow_list_with_group_out_schema, "返回 user 的关注者(粉丝)列表"),
      [401]: jsonContent(z.object({message: z.string()}), "未登录"),
      [404]: jsonContent(z.object({message: z.string()}), "用户不存在"),
    }
  }), async (c) => {
    const CU_ret = await get_current_user_and_res(c)
    // if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
    if (!CU_ret.success) return c.json(CU_ret.json_body, CU_ret.status)
    const auth_user = CU_ret.user

    const [{name}, {offset, limit}] = [c.req.valid("param"), c.req.valid("query")]
    // 查询 user
    const q_user = await db.query.user_table.findFirst({ where: eq(user_table.name, name) })
    if (!q_user) return c.json({ message: `用户 ${name} 不存在` }, 404)
    // 查询 user 关注的 people(user, group)
    const followers = await db.select({
      created_at: follow_table.created_at,
      type: follow_table.target_type,
      user: {
        id: user_table.id,
        name: user_table.name,
        image: user_table.image,
        email: user_table.email,
        nickname: user_table.nickname,
      },
      is_following: sql<boolean>`EXISTS (
        SELECT 1 FROM ${follow_table}
        WHERE ${follow_table.follower_id} = ${auth_user.id}
        and ${follow_table.target_id} = ${user_table.id}
      )`.as('is_following'),
      is_following_me: sql<boolean>`EXISTS (
        SELECT 1 FROM ${follow_table}
        WHERE ${follow_table.follower_id} = ${user_table.id}
        AND ${follow_table.target_id} = ${auth_user.id}
        -- AND ${follow_table.target_type} = 'user'
      )`.as('is_following_me'),
    }).from(follow_table)
      .leftJoin(user_table, eq(follow_table.follower_id, user_table.id))
      .leftJoin(group_table, eq(follow_table.follower_id, group_table.id))
      .where(eq(follow_table.target_id, q_user.id)).offset(offset).limit(limit)
    
    const [{count}] = await db.execute(sql`SELECT COUNT(*) FROM ${follow_table} WHERE ${follow_table.target_id} = ${q_user.id}`)
    return c.json({followers: followers, count: count})
  })
// 列出 user 关注的 people
router.openapi(
createRoute({
  tags: ["follow"],
  description: `列出 user 关注的 people
  - 注意 people 可能是 user, 也可能是 group`,
  path: "/users/{name}/following",
  method: "get",
  request: {
    params: NameParamsSchema,
    query: offset_limit_query_schema,
  },
  responses: {
    [200]: {
      description: "列出 user 关注的 people"
    }
  }
}), async (c) => {
  const [{name}, {offset, limit}] = [c.req.valid("param"), c.req.valid("query")]
  // 查询 user
  const q_user = await db.query.user_table.findFirst({ where: eq(user_table.name, name) })
  if (!q_user) return c.json({ message: `用户 ${name} 不存在` }, 404)
  // 查询 user 关注的 people
  const followings = await db.select().from(follow_table)
    .leftJoin(user_table, eq(follow_table.target_id, user_table.id))
    .leftJoin(group_table, eq(follow_table.target_id, group_table.id))
    .where(eq(follow_table.follower_id, q_user.id)).offset(offset).limit(limit)
    
  console.log('followings:', followings)
  return c.json(followings)
})
router.openapi(
  createRoute({
    tags: ["follow"], description: `列出 user 关注的 people\n
    - 携带 people 与 auth user 的关注关系
    - 注意 people 可能是 user, 也可能是 group
    - is_following_me: people是否关注 当前用户
    - me_is_following_him: 当前用户是否关注 people`,
    method: "get", path: "/user/{name}/following",
    request: {
      params: NameParamsSchema,
      query: offset_limit_query_schema,
    },
    responses: {
      [200]: jsonContent(follow_list_with_group_out_schema, "列出 user 关注的 people"),
      [401]: jsonContent(z.object({message: z.string()}), "未登录"),
      [404]: jsonContent(z.object({message: z.string()}), "用户不存在"),
    }
  }), async (c) => {
    const CU_ret = await get_current_user_and_res(c)
    if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
    const auth_user = CU_ret.user

    const [{name}, {offset, limit}] = [c.req.valid("param"), c.req.valid("query")]
    // 查询 user
    const q_user = await db.query.user_table.findFirst({ where: eq(user_table.name, name) })
    if (!q_user) return c.json({ message: `用户 ${name} 不存在` }, 404)
    // 查询 user 关注的 people(user, group)
    const followings = await db.select({
      created_at: follow_table.created_at,
      type: follow_table.target_type,
      user: {
        id: user_table.id,
        name: user_table.name,
        image: user_table.image,
        email: user_table.email,
        nickname: user_table.nickname,
      },
      group: {
        id: group_table.id,
        name: group_table.name,
        image: group_table.image,
        email: group_table.email,
        nickname: group_table.nickname,
      },
      is_following: sql<boolean>`EXISTS (
        SELECT 1 FROM ${follow_table}
        WHERE ${follow_table.follower_id} = ${auth_user.id}
        AND (${follow_table.target_id} = ${user_table.id} or ${follow_table.target_id} = ${group_table.id})
      )`.as('is_following'),
      is_following_me: sql<boolean>`EXISTS (
        SELECT 1 FROM ${follow_table}
        WHERE ${follow_table.follower_id} = ${user_table.id}
        AND ${follow_table.target_id} = ${auth_user.id}
        AND ${follow_table.target_type} = 'user'
      )`.as('is_following_me'),
    }).from(follow_table)
      .leftJoin(user_table, eq(follow_table.target_id, user_table.id))
      .leftJoin(group_table, eq(follow_table.target_id, group_table.id))
      .where(eq(follow_table.follower_id, q_user.id)).offset(offset).limit(limit)
    
    const [{count}] = await db.execute(sql`SELECT COUNT(*) FROM ${follow_table} WHERE ${follow_table.follower_id} = ${q_user.id}`)
    return c.json({followings: followings, count: count})
  })

export default router