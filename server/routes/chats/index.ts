
import { get_current_user_and_res } from "~/lib/middleware/auth"
import { sendMessage } from "~/lib/db/q/user/msg"
import { db } from "~/lib/db"
import { eq, and, sql, or, is, InferSelectModel } from "drizzle-orm"
import { message_table, chat_table } from "~/lib/db/schema/message"
import { user_table } from "~/lib/db/schema/user"
import httpStatus from "~/lib/http-status-codes"
import { createRouter } from "~/lib/create-app"
import { createRoute, z } from "@hono/zod-openapi"
import jsonContent from "~/lib/openapi/helpers/json-content"
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object"
import { createSelectSchema } from "drizzle-zod"
import { group_table } from "~/lib/db/schema/group"
import { offset_limit_query_schema } from "~/lib/schema/query"
import { ChatsWithCount, listChat_by_userId } from "~/lib/db/q/user/chat"

const router = createRouter()

const chat_table_schema = createSelectSchema(chat_table)

export type ChatsWithCountApiResBody = ChatsWithCount | { message: string }

router.openapi(createRoute({
  tags: ["chats"],description: `chats`,
  method: "get", path: "/chats",
  request: {query: offset_limit_query_schema },
  responses: {
    [httpStatus.OK]: jsonContent(z.object({
      items:z.array(z.object({
        chat: chat_table_schema,
        is_pinned: z.boolean().nullable(),
        target_user: z.object({
          id: z.string(),
          name: z.string(),
          nickname: z.string().nullable(),
          image: z.string(),
        }).nullable(),
        target_group: z.object({
          id: z.string(),
          name: z.string(),
          image: z.string().nullable(),
          members: z.array(z.object({
            id: z.string(),
            name: z.string(),
            image: z.string(),
          })).nullable(),
        }).nullable(),
      })),
      count: z.number(),
    }), "List of chat"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema("Unauthorized"), "Unauthorized"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
  const auth_user = CU_ret.user
  const { offset, limit } = c.req.valid("query")

  const {items, count} = await listChat_by_userId(auth_user.id, offset, limit)

  return c.json({
    items,
    count,
  }, httpStatus.OK);
});

export default router;