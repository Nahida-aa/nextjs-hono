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
import { create_sessionToken_and_setCookie } from "~/lib/middleware/utils";

export const sessionTokenWithName_schema = z.object({
  session_token: z.string(),
  token_type: z.string(),
  name: z.string(),
})
export type SessionTokenWithName = z.infer<typeof sessionTokenWithName_schema>;
export const login_schema = z.object({
  name: z.string().min(1),
  password: z.string().min(6),
});

const router = createRouter()
.openapi(createRoute({
  tags: ['auth'],
  method: 'post', path: '/auth/login',
  request: {
    body: jsonContent(
      login_schema,
      'login'
    )
  },
  responses: {
    [httpStatus.OK]: jsonContent(sessionTokenWithName_schema,
      '登录成功，响应头中会自动设置 sessionToken 到 Cookie 中',
    ),
    [httpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema, "用户未找到"
    ),
    [httpStatus.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("用户名或密码错误"),
      "用户名或密码错误"
    ),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(login_schema),
      'The validation error(s); 类型验证错误'
    ),
  }
}), async (c) => {
  const { name, password } = c.req.valid("json");
  const db_user = await db.query.user_table.findFirst({
    where: (user, { eq }) => eq(user.name, name),
  });
  if (!db_user) {
    return c.json({ message: 'User not found' }, 404);
  }
  const passwords_match = await compare(password, db_user.password!);
  if (!passwords_match) {
    return c.json({message: "用户名或密码错误"}, 401);
  }
  const session_token = await create_sessionToken_and_setCookie(c, db_user)
  return c.json({ session_token,  token_type: "Bearer", name: db_user.name }, 200);
})

export default router