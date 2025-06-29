import { createRouter } from "~/lib/create-app"
import { acceptFriendRequest, createFriendRequest, getFriendship } from "~/lib/db/q/user/friend"
import { httpStatusCodes } from "~/lib/http-status-codes"
import { get_current_user_and_res } from "~/lib/middleware/auth"
import jsonContent from "~/lib/openapi/helpers/json-content"
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object"
import { createRoute, z } from "@hono/zod-openapi"
import { not } from "drizzle-orm"
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";

const router = createRouter()

const add_friend_send_request_schema = z.object({
  receiver_id: z.string().uuid().openapi({example: '00000000-0000-0000-0000-000000000000'}), // 接收者id
  content: z.string().nullable().optional().openapi({example: 'hello'}) // 验证信息
})
export type AddFriendSendRequest = z.infer<typeof add_friend_send_request_schema>

router.openapi(createRoute({
  tags: ['friend'],
  method: "post", path: "/user/friend/request/send",
  request: {
    cookies: z.object({session_token: z.string().optional()}),
    headers: z.object({"authorization": z.string().optional()}),
    body: jsonContent(add_friend_send_request_schema,'add friend send request')
  },
  responses: {
    [200]: jsonContent(z.object({
    }), "当前用户的好友列表"),
    [422]: jsonContent(createErrorSchema(add_friend_send_request_schema), 'The validation error(s); 验证错误'),
    [401]: jsonContent(createMessageObjectSchema(), "Unauthorized: xxx"),
    [409]: jsonContent(createMessageObjectSchema(), "Conflict: xxx"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
  const auth_user = CU_ret.user
  const sender_id = auth_user.id
  let { receiver_id, content } = c.req.valid("json")
  if (!content) content = ''
  console.log('content:', content)
  
  // 获取(检查)好友关系状态
  const friendship = await getFriendship(sender_id, receiver_id)
  if (friendship) return c.json({ message: "Friend already exists" }, 409)

  console.log(`route: sender_id: ${sender_id}, receiver_id: ${receiver_id}, content: ${content}`)
  const notification = await createFriendRequest(sender_id, receiver_id, content)
  return c.json({}, 200)
})

router.openapi(createRoute({
  tags: ['friend'],
  method: "post", path: "/user/friend/request/accept",
  request: {
    body: jsonContent(
      z.object({
        notification_id: z.string(),
        sender_id: z.string(),
        content: z.string().nullable().optional()
      }),
      'add friend accept request'
    )
  },
  responses: {
    [200]: jsonContent(z.object({
    }), "当前用户的好友列表"),
    [401]: jsonContent(createMessageObjectSchema(), "Unauthorized: xxx"),
    [409]: jsonContent(createMessageObjectSchema(), "Conflict: xxx"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
  const auth_user = CU_ret.user
  const receiver_id = auth_user.id
  let { notification_id, sender_id, content } = c.req.valid("json")
  if (!content) content = "我们已经成功添加为好友,现在可以开始聊天啦~"
  
  await acceptFriendRequest(notification_id, sender_id, receiver_id, content)
  return c.json({}, 200)
})

export default router