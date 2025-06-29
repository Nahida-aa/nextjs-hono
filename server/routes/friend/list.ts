import { createRouter } from "~/lib/create-app";
import { friendIdList_byUserId, UserLsWithCount, userLsWithCount_isFriend_by_currentUserId, userLsWithCount_notFriend_by_currentUserId_word, UserLsWithCountSchema_whenAddFriend } from "~/lib/db/q/user/friend";
import { user_table } from "~/lib/db/schema/user";
import { get_current_user_and_res } from "~/lib/middleware/auth";
import jsonContent from "~/lib/openapi/helpers/json-content";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { offset_limit_query_schema, offset_limit_query_schema_withQ } from "~/lib/schema/query";
import { user_meta_schema } from "~/lib/schema/user";
import { createRoute, z } from "@hono/zod-openapi";
import { and, ilike, notInArray, or } from "drizzle-orm/sql/expressions/conditions";

const router = createRouter()

export type UserListIsFriend_ApiResBody = UserLsWithCount | { message: string }

router.openapi(createRoute({
  tags: ['friend'],
  method: "get", path: "/user/list/is_friend",
  request: {query: offset_limit_query_schema },
  responses: {
    [200]: jsonContent(z.object({
      users: z.array(user_meta_schema),
      count: z.number()
    }), "当前用户的好友列表"),
    [401]: jsonContent(createMessageObjectSchema(), "Unauthorized: xxx"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
  const auth_user = CU_ret.user
  const {  offset, limit } = c.req.valid("query")

  const {users, count} = await userLsWithCount_isFriend_by_currentUserId(auth_user.id, offset, limit)
  return c.json({users, count}, 200)
})


router.openapi(createRoute({
  tags: ['friend'],
  method: "get", path: "/user/list/not_friend",
  request: {query: offset_limit_query_schema_withQ,},
  responses: {
    [200]: jsonContent(UserLsWithCountSchema_whenAddFriend, "想要添加好友时搜索的结果列表"),
    [401]: jsonContent(createMessageObjectSchema(), "Unauthorized: xxx"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
  const auth_user = CU_ret.user
  const { q, offset, limit } = c.req.valid("query")

  const {users, count} = await userLsWithCount_notFriend_by_currentUserId_word(auth_user.id, q, offset, limit)
  return c.json({users, count}, 200)
})

export default router