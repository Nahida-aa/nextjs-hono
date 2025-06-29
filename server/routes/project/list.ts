import { createRouter } from "~/lib/create-app";
import { createRoute, z } from "@hono/zod-openapi";
import { group_table } from "~/lib/db/schema/group";
import jsonContent from "~/lib/openapi/helpers/json-content";
import httpStatus from "~/lib/http-status-codes"
import { db } from "~/lib/db";
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import { get_current_user_and_res, get_session_token_payload, SessionTokenPayload } from "~/lib/middleware/auth";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { createDBProject } from "~/lib/db/q/project/create";
import { linkUserGroup } from "~/lib/db/schema/linkUserGroup";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { eq, and, InferSelectModel } from "drizzle-orm";
import { listProjectByUser, ListProjectByUserResult } from "~/lib/db/q/project/get";
import { proj_table } from "~/lib/db/schema/proj";
import { offset_limit_query_schema } from "~/lib/schema/query";

export type DBProj = InferSelectModel<typeof proj_table>;
// export const DBProjSchema = createSelectSchema(proj_table); // 意思Bug
const DBProjSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  slug: z.string(),
  icon_url: z.string().nullable(),
  download_count: z.number(),
  follow_count: z.number(),
  environment: z.string().nullable(),
  license: z.string().nullable(),
  is_open_source: z.boolean().nullable(),
  game_versions: z.array(z.string()),
  loaders: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  visibility: z.string(),
});

const router = createRouter()


const ListProjSchema = z.object({
  records: z.array(DBProjSchema),
  count: z.number(),
})

type ListProj = z.infer<typeof ListProjSchema>

router.openapi(createRoute({
  tags: ["project"], method: "get", path: "/project/by-user",
  request: { query: offset_limit_query_schema,
  },
  responses: {
    [httpStatus.CREATED]: jsonContent(ListProjSchema, "list project"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema('Unauthorized'),'Unauthorized: 未登录'),
    // [httpStatus.FORBIDDEN]: jsonContent(createMessageObjectSchema('Forbidden'),'Forbidden: 禁止的'),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(offset_limit_query_schema),'The validation error(s); 验证错误'),
  },
}), async (c) => {
  const CU_ret = await get_current_user_and_res(c)
  if (!CU_ret.success) return c.json(CU_ret.json_body, CU_ret.status)
  const auth_user = CU_ret.user
  
  const { offset, limit } = c.req.valid("query")

  const list_project_out: ListProjectByUserResult = await listProjectByUser({ userId: auth_user.id, offset, limit })
  list_project_out.records[0].game_versions

  return c.json(list_project_out, httpStatus.CREATED)
})


export default router