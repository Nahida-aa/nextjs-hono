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
import { projectMember_table } from "~/lib/db/schema/proj";
import { createDBProjectRelease } from "~/lib/db/q/project/release/create";

const router = createRouter()


const createReleaseSchema = z.object({
  id: z.string(),
  name: z.string(), // title 
  project_id: z.string(),
  // creator_id: z.string(), // 由 auth_user.id 获取
  version_number: z.string(),
  type: z.string(), // 'release' | 'pre-release' | 'draft'
  description: z.string().optional(),
  loaders: z.array(z.string()),
  game_versions: z.array(z.string()),
  files: z.array(z.object({
    name: z.string(),
    pathname: z.string(),
    size: z.number(),
    type: z.string(),
    loaders: z.array(z.string()),
    game_versions: z.array(z.string()),
  })),
})
export type CreateProjectReq = z.infer<typeof createReleaseSchema>;

router.openapi(createRoute({
  tags: ["release"], method: "post", path: "/project/release",
  request: {
    body: jsonContent(createReleaseSchema, "create release"),
  },
  responses: {
    [httpStatus.CREATED]: jsonContent(createReleaseSchema, "created release"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema('Unauthorized'),'Unauthorized: 未登录'),
    [httpStatus.FORBIDDEN]: jsonContent(createMessageObjectSchema('Forbidden'),'Forbidden: 禁止的'),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(createReleaseSchema),'The validation error(s); 验证错误'),
  },
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, CU_ret.status)
  const auth_user = CU_ret.user
  const creator_id = auth_user.id
  const release_in = c.req.valid("json")

  // 检查 auth_user 是否为该 project 的成员
  const isMember = await db.select().from(projectMember_table)
    .where(and(eq(projectMember_table.project_id, release_in.project_id), eq(projectMember_table.member_id, auth_user.id)))
    .limit(1);
  if (isMember.length === 0) {
    return c.json({ message: 'Forbidden: You are not a member of the specified project' }, httpStatus.FORBIDDEN);
    }

  const created_release_out = await createDBProjectRelease({
    ...release_in,
    creator_id: auth_user.id
  })
  return c.json(created_release_out, httpStatus.CREATED)
})

export default router