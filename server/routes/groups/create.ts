import { createRouter } from "~/lib/create-app";
import { createRoute, z } from "@hono/zod-openapi";
import { group_table } from "~/lib/db/schema/group";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import jsonContent from "~/lib/openapi/helpers/json-content";
import httpStatus from "~/lib/http-status-codes"
import { db } from "~/lib/db";
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import { get_current_user_and_res, get_session_token_payload, SessionTokenPayload } from "~/lib/middleware/auth";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { linkUserGroup } from "~/lib/db/schema/linkUserGroup";
import { user_meta_schema } from "~/lib/schema/user";
import { UserMeta } from "~/components/layout/sidebar/user-side-toggle";
import { chat_table } from "~/lib/db/schema/message";
import exp from "constants";
import { createChat } from "~/lib/db/q/user/chat";

const router = createRouter()

const group_selectSchema = createSelectSchema(group_table).extend({
  members: z.array(user_meta_schema.nullable())
})
const group_insertSchema = createInsertSchema(group_table).omit({id:true, creator_id: true, created_at: true, updated_at: true, followers_count: true})

const createGroupSchema = z.object({
  name: z.string(), // 由客户端生成(没有输入的情况下)
  members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  })).optional(),
})
export type CreateGroupReq = z.infer<typeof createGroupSchema>;
router.openapi(createRoute({
  tags: ["group"], method: "post", path: "/groups",
  request: {
    body: jsonContent(createGroupSchema, "create group"),
  },
  responses: {
    [httpStatus.CREATED]: jsonContent(createGroupSchema, "created group"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema('Unauthorized'),'Unauthorized: 未登录'),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(createGroupSchema),'The validation error(s); 验证错误'),
  },
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, CU_ret.status)
  const auth_user = CU_ret.user
  const in_group = c.req.valid("json")

  const created_group_out = await auth_create_group_outMembers(auth_user, in_group)
  return c.json(created_group_out, httpStatus.CREATED)
})

export async function auth_create_group_outMembers(auth_user: UserMeta, in_group: z.infer<typeof createGroupSchema>) {
  const { members, ...group_fields } = in_group
  return await db.transaction(async (tx) => {
    const [db_group] = await tx.insert(group_table).values({...group_fields, creator_id:auth_user.id}).returning()

    // 检查是否存在 auth_user，如果不存在则加入
    const members_with_auth_user = members?.some((m) => m.id === auth_user.id)
    ? members
    : [...(members || []), { id: auth_user.id, name: auth_user.name, image: auth_user.image }];

    const members_without_auth_user = members_with_auth_user.filter((m) => m.id !== auth_user.id);
    const groupLinkUser_ls = [
      { user_id: auth_user.id, group_id: db_group.id, role: 'owner' },
      ...members_without_auth_user.map((m) => ({ user_id: m.id, group_id: db_group.id, role: 'member' }))
    ];

    await tx.insert(linkUserGroup).values(groupLinkUser_ls)
    
    // TODO: 给创建者创建 一个 chat
    const member_names = members_without_auth_user?.map((m) => m.name).join(', ')
    const ids = members_without_auth_user?.map((m) => m.id)
    await createChat("group", ids, member_names, db_group.id)
    // TODO: 返回内容考虑, restful 是返回输入, 但我不这么认为, 后面我会提供更精细化 api
    return { ...db_group, members: members_with_auth_user }
  })
}

export default router