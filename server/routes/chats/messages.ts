
import { get_current_user_and_res } from "~/lib/middleware/auth"
import { listMessageWithSender_by_chatId, listMessageWithSender_by_chatId_cursor, sendMessage } from "~/lib/db/q/user/msg"
import { db } from "~/lib/db"
import { eq, and, sql, or, is, InferSelectModel } from "drizzle-orm"
import { message_table, chat_table } from "~/lib/db/schema/message"
import { user_table } from "~/lib/db/schema/user"
import httpStatus from "~/lib/http-status-codes"
import { createRouter } from "~/lib/create-app"
import { createRoute, z } from "@hono/zod-openapi"
import jsonContent from "~/lib/openapi/helpers/json-content"
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object"
import { offset_limit_query_schema } from "~/lib/schema/query"

const router = createRouter()

router.openapi(createRoute({
  tags: ["chats"], description: `Send a message`,
  method: "post", path: "/chats/messages",
  request: {
    body: jsonContent(z.object({
      target_id: z.string(),
      content: z.string(),
      target_type: z.enum(['user', 'group']),
    }), "Send message")
  },
  responses: {
    [httpStatus.CREATED]: jsonContent(z.object({
      id: z.string(),
      chat_id: z.string(),
      sender_id: z.string(),
      content: z.string(),
      created_at: z.string(),
    }), "Message created"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema("Unauthorized"), "Unauthorized"),
    // [httpStatus.INTERNAL_SERVER_ERROR]: jsonContent(z.object({
    //   message: z.string()
    // }), "Internal Server Error")
  }
}), async (c) => {
  const current_user_ret = await get_current_user_and_res(c);
  if (!current_user_ret.success) return c.json(current_user_ret.json_body, current_user_ret.status);
  const current_user = current_user_ret.user;

  const { target_id, content, target_type } = c.req.valid("json");

  // try {
    const message = await sendMessage({
      sender_id: current_user.id,
      content: content,
    }, target_id, target_type);
    return c.json(message, httpStatus.CREATED);
  // } catch (error: any) {
  //   // return c.json({ message: error.message }, httpStatus.INTERNAL_SERVER_ERROR);
  // }
});

router.openapi(createRoute({
  tags: ["chats"],description: `Get list of messages`,
  method: "get", path: "/chats/{chat_id}/messages",
  request: {
    params: z.object({
      chat_id: z.string()
    }), 
    query: offset_limit_query_schema
  },
  responses: {
    [httpStatus.OK]: jsonContent(z.object({
      messages: z.array(z.object({
        id: z.string(),
        sender_id: z.string(),
        sender: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().nullable().optional(),
          image: z.string().nullable(),
          nickname: z.string().nullable().optional(),
        }).nullable(),
        content: z.string(),
        created_at: z.string(),
      })),
      count: z.number()
    }), "List of messages"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema("Unauthorized"), "Unauthorized"),
    [httpStatus.NOT_FOUND]: jsonContent(createMessageObjectSchema("Chat not found"), "Chat not found"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
  const auth_user = CU_ret.user

  const { chat_id } = c.req.valid("param");
  const { offset, limit } = c.req.valid("query");

  // 查询聊天是否存在
  const [chat] = await db.select().from(chat_table).where(eq(chat_table.id, chat_id))
  if (!chat) return c.json({ message: "Chat not found" }, httpStatus.NOT_FOUND);

  // 查询聊天的消息列表
  const { messages, count } = await listMessageWithSender_by_chatId(chat_id, offset, limit)

  return c.json({ messages, count }, httpStatus.OK);
});

const msgLsCursorSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    chat_id: z.string(),
    sender_id: z.string(),
    sender: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().nullable().optional(),
      image: z.string().nullable(),
      nickname: z.string().nullable().optional(),
    }).nullable(),
    content: z.string(),
    created_at: z.date(),
    updated_at: z.date().nullable().optional(),
  })),
  next_cursor: z.object({
    id: z.string(),
    created_at: z.date(),
  }).optional()
});

export interface Msg {
  id: string;
  chat_id: string;
  sender_id: string;
  sender: {
    id: string;
    name: string;
    email?: string | null;
    image?: string|null;
    nickname?: string | null ;
  } | null;
  content: string;
  created_at: Date;
  updated_at?: Date | null ;
}
export type MsgLsCursor = z.infer<typeof msgLsCursorSchema>;
export interface MsgLsCursorI {
  items: Msg[]
  next_cursor?: {
    id: string;
    created_at: Date;
  }
}

router.openapi(createRoute({
  tags: ["chats"],description: `Get list of messages`,
  method: "get", path: "/chats/{chat_id}/msgs/cursor",
  request: {
    params: z.object({
      chat_id: z.string()
    }), 
    query: z.object({
      limit: z.coerce.number().int().min(1).max(100).default(30),
      cursor_id: z.string().nullable().optional(),
      cursor_created_at: z.string().nullable().optional(),
    })
  },
  responses: {
    [httpStatus.OK]: jsonContent(msgLsCursorSchema, "List of messages"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema("Unauthorized"), "Unauthorized"),
    [httpStatus.NOT_FOUND]: jsonContent(createMessageObjectSchema("Chat not found"), "Chat not found"),
  }
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, 401)
  const auth_user = CU_ret.user

  const { chat_id } = c.req.valid("param");
  const { cursor_id, cursor_created_at, limit } = c.req.valid("query");
  const cursor = cursor_created_at && cursor_id  ? { id: cursor_id, created_at: new Date(cursor_created_at) } : undefined;

  // 查询聊天是否存在
  const [chat] = await db.select().from(chat_table).where(eq(chat_table.id, chat_id))
  if (!chat) return c.json({ message: "Chat not found" }, httpStatus.NOT_FOUND);

  // 查询聊天的消息列表
  const { items, next_cursor } = await listMessageWithSender_by_chatId_cursor(chat_id, {limit, cursor})

  return c.json({ items, next_cursor }, httpStatus.OK);
});

export default router;