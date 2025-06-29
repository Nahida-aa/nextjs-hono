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
import { createDBProject } from "~/lib/db/q/project/create";
import { linkUserGroup } from "~/lib/db/schema/linkUserGroup";
import { eq, and } from "drizzle-orm";

const router = createRouter()


const createProjectSchema = z.object({
  name: z.string(), // title 
  slug: z.string(), // 由客户端生成(没有输入的情况下)
  summary: z.string().optional(),
  visibility: z.string().default("public").optional(),
  owner_type: z.string(), //'user' | 'group';
  owner_id: z.string(), 
  // creator_id: z.string()
})
export type CreateProjectReq = z.infer<typeof createProjectSchema>;
const createProjectResSchema = z.object({
  slug: z.string()
});
router.openapi(createRoute({
  tags: ["project"], method: "post", path: "/project",
  request: {
    body: jsonContent(createProjectSchema, "create project"),
  },
  responses: {
    [httpStatus.CREATED]: jsonContent(createProjectResSchema, "created project"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema('Unauthorized'),'Unauthorized: 未登录'),
    [httpStatus.FORBIDDEN]: jsonContent(createMessageObjectSchema('Forbidden'),'Forbidden: 禁止的'),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(createProjectSchema),'The validation error(s); 验证错误'),
  },
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, CU_ret.status)
  const auth_user = CU_ret.user
  const in_project = c.req.valid("json")

  // 检查 owner_type 是否为 group，如果是，则检查 auth_user 是否为该 group 的成员
  if (in_project.owner_type === 'group') {
    const isMember = await db.select().from(linkUserGroup)
      .where(and(eq(linkUserGroup.group_id, in_project.owner_id), eq(linkUserGroup.user_id, auth_user.id)))
      .limit(1);

    if (isMember.length === 0) {
      return c.json({ message: 'Forbidden: You are not a member of the specified group' }, httpStatus.FORBIDDEN);
    }
  } else {
    // 检查 owner_type 是否为 user，如果是，则检查 auth_user 是否为该 user
    if (in_project.owner_id !== auth_user.id) {
      return c.json({ message: 'Forbidden: You are not the specified user' }, httpStatus.FORBIDDEN);
    }
  }

  const created_project_out = await createDBProject({
    ...in_project,
    creator_id: auth_user.id
  })
  return c.json(created_project_out, httpStatus.CREATED)
})


export default router