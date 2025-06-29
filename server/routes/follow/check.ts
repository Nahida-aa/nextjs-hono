import { createRouter } from "~/lib/create-app";
import NameParamsSchema from "~/lib/openapi/schemas/name-params";
import { StatusCode } from "hono/utils/http-status";
import httpStatus from "~/lib/http-status-codes"
import { get_current_user_and_res } from "~/lib/middleware/auth";
import { follow_table } from "~/lib/db/schema/follow";
import { db } from "~/lib/db";
import { sql } from "drizzle-orm";
import { createRoute } from "@hono/zod-openapi";
import jsonContent from "~/lib/openapi/helpers/json-content";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { user_table } from "~/lib/db/schema/user";
import { group_table } from "~/lib/db/schema/group";

const router = createRouter()
// 检测 auth_user 是否关注 user
router.openapi(createRoute({
  tags: ["follow"],
  description: `检测 auth_user 是否关注 user`,
  path: "/user/following/{name}",
  method: "get",
  request: {
    params: NameParamsSchema
  },
  responses: {
    [httpStatus.NO_CONTENT]: {description: "204 说明 auth_user 关注了 user"},
    [httpStatus.NOT_FOUND]: jsonContent(createMessageObjectSchema("auth_user 没有关注 user"), "auth_user 没有关注 user"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, CU_ret.status)
  const current_user = CU_ret.user

  const { name } = c.req.valid("param")
  const [q_user] = await db.select({id: user_table.id}).from(user_table).where(sql`${user_table.name} = ${name}`)
  if (!q_user) return c.json({ message: `user: ${name} 不存在` }, httpStatus.NOT_FOUND)
  // 检测 auth_user 是否关注 user
  const is_following = await db.select().from(follow_table).where(
    sql`${follow_table.follower_id} = ${current_user.id} and ${follow_table.target_id} = ${q_user.id}`)

  if (is_following.length === 0) return c.json({ message: `auth_user 没有关注 ${name}` }, httpStatus.NOT_FOUND)
  return c.json(undefined, httpStatus.NO_CONTENT)
})

export async function auth_user_is_following_user(auth_user_id: string, user_id: string): Promise<boolean> {
  const is_following = await db.select().from(follow_table).where(
    sql`${follow_table.follower_id} = ${auth_user_id} and ${follow_table.target_id} = ${user_id}`)
  return is_following.length > 0
}

export default router