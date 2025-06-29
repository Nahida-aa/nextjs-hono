import jsonContent from "~/lib/openapi/helpers/json-content";
import { createRoute, z } from "@hono/zod-openapi";
import httpStatus from "~/lib/http-status-codes"
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import { not } from "drizzle-orm";
import { notFoundSchema } from "~/lib/constans";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { idCardInfo_insertSchema, } from "~/lib/schema/userBy"
import {user as userTable, idCardInfo as idCardInfoTable, User, idCardInfo, } from "~/lib/db/schema/user"
import { createInsertSchema } from "drizzle-zod";

import { db } from "~/lib/db";
import { eq } from "drizzle-orm";
import { compare, hash, hashSync } from "bcrypt-ts";

import { createRouter } from "~/lib/create-app";
import { createJWT } from "~/lib/core/token";
import settings from "~/lib/settings";
import { create_sessionToken_and_setCookie, set_delCookie } from "~/lib/middleware/utils";

export const logout_in_schema = z.object({
  csrfToken: z.string(),
  redirectTo: z.string(),
});
export const logout_out_schema = z.object({
  url: z.string(),
});

const router = createRouter()
.openapi(createRoute({
  tags: ['auth'],
  method: 'post', path: '/auth/logout',
  request: {
    body: jsonContent(
      logout_in_schema,
      'logout'
    )
  },
  responses: {
    [httpStatus.OK]: jsonContent(logout_out_schema,
      '登录成功，响应头中会自动设置 del sessionToken 到 Cookie 中',
    ),

    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(logout_in_schema),
      'The validation error(s); 类型验证错误'
    ),
  }
}), async (c) => {
  const { csrfToken, redirectTo } = c.req.valid("json");
  await set_delCookie(c)
  return c.json({ url: redirectTo }, 200);
})

export default router