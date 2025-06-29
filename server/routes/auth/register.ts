import { createRouter } from "~/lib/create-app"
import jsonContent from "~/lib/openapi/helpers/json-content";
import { createRoute, z } from "@hono/zod-openapi";
import {httpStatusCodes} from "~/lib/http-status-codes"
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import { not } from "drizzle-orm";
import { notFoundSchema } from "~/lib/constans";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { createInsertSchema } from "drizzle-zod";
import { db } from "~/lib/db";
import { createJWT, verifyJWT } from "~/lib/core/token";
import { idCardInfo_insertSchema, platformInfo_schema, } from "~/lib/schema/userBy"
import { user_table, idCardInfo_table, User } from "~/lib/db/schema/user"
import { eq } from "drizzle-orm";
import { genSaltSync, hash, hashSync } from 'bcrypt-ts';
import { compare } from 'bcrypt-ts';
import settings from "~/lib/settings";
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import jsonContentOneOf from "~/lib/openapi/helpers/json-content-one-of";
import { create_sessionToken_and_setCookie } from "~/lib/middleware/utils";
import { sessionTokenWithName_schema } from "./login";

export const register_user_schema = z.object({
  name: z.string().min(1).max(32),
  password: z.string().min(6).max(64),
  phone: z.string().min(1).max(64),
  image: z.string().optional(),
  platform_info: platformInfo_schema.nullable().optional(),
  id_card_info: z.object({
    id_card_number: z.string(),
    id_card_holder: z.string().default("self").optional()
  })
});
export type ReqRegisterUserBody = z.infer<typeof register_user_schema>

const router = createRouter()
.openapi(createRoute({
  tags: ['auth'], method: 'post', path: '/auth/register',
  request: {
    body: jsonContent(register_user_schema,'create user')
  },
  responses: {
    [httpStatusCodes.CREATED]: jsonContent(sessionTokenWithName_schema, '成功'),
    [httpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(register_user_schema), 'The validation error(s); 验证错误'),
    [httpStatusCodes.CONFLICT]: jsonContent(createMessageObjectSchema('用户名或手机号或身份证号已存在'), '用户名或手机号或身份证号已存在')
  }
}), async (c) => {
  console.log('c.req:', c.req);
  const  body_json = c.req.valid("json")
  const { id_card_info: id_card_info_data, ...user_data } = body_json;
  // 避免重复注册的检查
  const [existing_name] = await db.select({name: user_table.name}).from(user_table).where(eq(user_table.name, user_data.name))

  if (existing_name) return c.json({ message: `用户名: ${existing_name.name}已存在` }, httpStatusCodes.CONFLICT);

  const [existing_phone] = await db.select({phone: user_table.phone}).from(user_table).where(eq(user_table.phone, user_data.phone));

  if (existing_phone) return c.json({ message: `手机号: ${existing_phone.phone}已存在` }, httpStatusCodes.CONFLICT);

  const [existing_id_card] = await db.select({id_card_number: idCardInfo_table.id_card_number}).from(idCardInfo_table).where(eq(idCardInfo_table.id_card_number, id_card_info_data.id_card_number));

  if (existing_id_card)  return c.json({ message: `身份证号: ${existing_id_card.id_card_number}已存在` }, httpStatusCodes.CONFLICT);

  // 检查是否提供 image, 如果没有提供, 使用默认的
  const avatar_url = !user_data.image ? `https://avatar.vercel.sh/${user_data.name}` : user_data.image
  // if (!user_data.image) {
  //   user_data.image = `https://avatar.vercel.sh/${user_data.name}` as string
  //   // user_data.image as string
  // }
  // user_data.image
  
  const hash_password = await hash(user_data.password, 10);
  user_data.password = hash_password;

  const db_user = await db.transaction(async (tx) => {
    const [db_user] = await tx.insert(user_table).values({
      ...user_data,
      image: avatar_url,
    }).returning();
    if (id_card_info_data) {
      await tx.insert(idCardInfo_table).values({
        ...id_card_info_data,
        user_id: db_user.id
      })
    }
    return db_user;
  })

  const session_token = await create_sessionToken_and_setCookie(c, db_user)
  const res = { session_token, token_type: "Bearer", name: db_user.name }
  return c.json(res, httpStatusCodes.CREATED);
})

const signUp_schema = z.object({
  name: z.string().min(1).max(32),
  password: z.string().min(6).max(64),
});
router.openapi(createRoute({
  tags: ['auth'],
  method: 'post', path: '/auth/sign-up',
  request: {
    body: jsonContent(signUp_schema,'create user')
  },
  responses: {
    [httpStatusCodes.CREATED]: jsonContent(sessionTokenWithName_schema, '成功'),
    [httpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(register_user_schema), 
      'The validation error(s); 验证错误'
    ),
    [httpStatusCodes.CONFLICT]: jsonContent(createMessageObjectSchema('用户名或手机号或身份证号已存在'), '用户名或手机号或身份证号已存在')
  }
}), async (c) => {
  const  body_json = c.req.valid("json")
  const {...user_data } = body_json;
  // 避免重复注册的检查
  const existing_user = await db.query.user_table.findFirst({
    where: (user, { eq }) => eq(user.name, user_data.name),
  });
  if (existing_user) {
    return c.json({ message: '用户名已存在' }, httpStatusCodes.CONFLICT);
  }

  const user_data_image = `https://avatar.vercel.sh/${user_data.name}` as string

  const hash_password = await hash(user_data.password, 10);
  user_data.password = hash_password;

  const db_user = await db.transaction(async (tx) => {
    const [db_user] = await tx.insert(user_table).values({
      ...user_data,
      image: user_data_image,
    }).returning();
    return db_user;
  })

  const session_token = await create_sessionToken_and_setCookie(c, db_user)
  const res = { session_token, token_type: "Bearer", name: db_user.name }
  return c.json(res, httpStatusCodes.CREATED);
})

export default router