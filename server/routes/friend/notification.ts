import { createRouter } from "~/lib/create-app"
import { db } from "~/lib/db"
import { userLsWithCount_isFriend_by_currentUserId } from "~/lib/db/q/user/friend"
import { friendNotification_table } from "~/lib/db/schema/notification"
import { user_table } from "~/lib/db/schema/user"
import { get_current_user_and_res } from "~/lib/middleware/auth"
import jsonContent from "~/lib/openapi/helpers/json-content"
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object"
import { offset_limit_query_schema } from "~/lib/schema/query"
import { user_meta_schema } from "~/lib/schema/user"
import { createRoute, z } from "@hono/zod-openapi"
import { aliasedTable } from "drizzle-orm"
import { and, eq, ilike, notInArray, or } from "drizzle-orm/sql/expressions/conditions";

const router = createRouter()

export interface NotificationUser {
  id: string,
  name: string,
  nickname: string | null,
  image: string,
}
export type FriendNotificationList_ApiResBody_OK = {
  notifications: {
    notification: {
      id: string,
      status: string,
      content: string,
      sender_id: string,
      receiver_id: string,
      created_at: string,
      // updated_at: string,
    },
    sender: NotificationUser,
    receiver: NotificationUser,
  }[],
  count: number
}
export type FriendNotificationList_ApiResBody = FriendNotificationList_ApiResBody_OK | { message: string }

router.openapi(createRoute({
  tags: ['friend'],
  method: "get", path: "/friend/notification/list",
  summary: "列出好友通知",
  request: {query: offset_limit_query_schema },
  responses: {
    [200]: jsonContent(z.object({
      notifications: z.array(z.object({
        notification: z.object({
          id: z.string(),
          status: z.string(),
          content: z.string(),
          sender_id: z.string(),
          receiver_id: z.string(),
          created_at: z.string(),
          // updated_at: z.string(),
        }),
        sender: z.object({
          id: z.string(),
          name: z.string(),
          nickname: z.string().nullable(),
          image: z.string().nullable(),
        }).nullable(),
        receiver: z.object({
          id: z.string(),
          name: z.string(),
          nickname: z.string().nullable(),
          image: z.string().nullable(),
        }).nullable(),
      })),
      count: z.number()
    }), "好友通知列表"),
    [401]: jsonContent(createMessageObjectSchema(), "Unauthorized: xxx"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
  const auth_user = CU_ret.user

  const { offset, limit } = c.req.valid("query")

  const sender_table = aliasedTable(user_table, 'sender')
  const notificationsQuery = db.select({
    notification: friendNotification_table,
    sender: {
      id: sender_table.id,
      name: sender_table.name,
      nickname: sender_table.nickname,
      image: sender_table.image,
    },
    receiver: {
      id: user_table.id,
      name: user_table.name,
      nickname: user_table.nickname,
      image: user_table.image,
    },
  }).from(friendNotification_table)
    .leftJoin(sender_table, eq(friendNotification_table.sender_id, sender_table.id))
    .leftJoin(user_table, eq(friendNotification_table.receiver_id, user_table.id))
    .where(or(eq(friendNotification_table.receiver_id, auth_user.id), eq(friendNotification_table.sender_id, auth_user.id)))

  const count = (await notificationsQuery).length

  const notifications = await notificationsQuery.offset(offset).limit(limit);

  return c.json({notifications, count}, 200)
})

export default router