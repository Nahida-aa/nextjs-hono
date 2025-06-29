import { createRoute, z } from "@hono/zod-openapi";
import jsonContent from "~/lib/openapi/helpers/json-content";
import httpStatus from "~/lib/http-status-codes"
import { notFoundSchema } from "~/lib/constans";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import { login_schema } from "./login";

const loginUseNameOrEmailOrPhoneSchema = z.object({
  nameOrEmailOrPhone: z.string().min(1),
  password: z.string().min(6),
});
export const loginUseNameOrEmailOrPhone = createRoute({
  tags: ['auth'],
  path: '/auth/login-or',
  method: 'post',
  request: {
    body: jsonContent(
      loginUseNameOrEmailOrPhoneSchema,
      'loginUseNameOrEmailOrPhone'
    )
  },
  responses: {
    [httpStatus.OK]: jsonContent(
      z.object({
        sessionToken: z.string(),
        tokenType: z.string().openapi({example: 'Bearer'}),
      }),
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
      createErrorSchema(loginUseNameOrEmailOrPhoneSchema),
      'The validation error(s); 类型验证错误'
    ),
  }
})

export const login2token = createRoute({
  tags: ['login'],
  path: '/login2token',
  method: 'post',
  request: {
    body: jsonContent(
      login_schema,
      'login'
    )
  },
  responses: {
    [httpStatus.OK]: jsonContent(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        tokenType: z.string().openapi({example: 'Bearer'}),
      }),
      'login-ed'
    ),
    [httpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema, "用户未找到"
    ),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(login_schema),
      'The validation error(s); 类型验证错误'
    ),
  }
})