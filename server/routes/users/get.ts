import { db } from "~/lib/db";
import httpStatus from "~/lib/http-status-codes"
import { user_selectSchema } from "~/lib/schema/userBy";
import { createRouter } from "~/lib/create-app";
import jsonContent from "~/lib/openapi/helpers/json-content";
import { createRoute, z } from "@hono/zod-openapi";
import { notFoundSchema } from "~/lib/constans";
import IdUUIDParamsSchema from "~/lib/openapi/schemas/id-uuid-params";
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import NameParamsSchema from "~/lib/openapi/schemas/name-params";
import { idCardInfo_table, user_table } from "~/lib/db/schema/user";
import { eq, getTableColumns } from "drizzle-orm";

const router = createRouter()

router.openapi(createRoute({
  tags: ['user'],
  path: '/users',
  method: 'get',
  responses: {
    [httpStatus.OK]: jsonContent(
      z.array(
        user_selectSchema
      ),
      'List of user'
    )
  }
}), async (c) => {
  // 关联查询身份证信息
  const dbUsers = await db.select({
    ...getTableColumns(user_table),
    // {...user_table},
    id_card_info: idCardInfo_table
  }).from(user_table).leftJoin(idCardInfo_table, eq(user_table.id, idCardInfo_table.user_id))
  // const dbUsers = await db.query.user.findMany({
  //   with: {
  //     id_card_info: true, // 
  //   }
  // })
  return c.json(dbUsers, httpStatus.OK)
})

router.openapi(createRoute({
  tags: ['user'],
  path: '/users/{id}',
  method: 'get',
  request: {
    params: IdUUIDParamsSchema
  },
  responses: {
    [httpStatus.OK]: jsonContent(
      user_selectSchema,
      'get user'
    ),
    [httpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found; 用户未找到'
    ),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema), 
      'The validation error(s); 验证错误'
    ),
  }
}), async (c) => {
  const { id } = c.req.valid("param")
  const dbUser = await db.query.user_table.findFirst({
    where: (user, { eq }) => eq(user.id, id),
    with: {
      id_card_info: true, // 关联查询身份证信息
    }
  });
  if (!dbUser) {
    return c.json({ message: 'User not found' }, httpStatus.NOT_FOUND)
  }
  return c.json(dbUser, httpStatus.OK)
})

router.openapi(createRoute({
  tags: ['user'],
  path: '/users/name/{name}',
  method: 'get',
  request: {
    params: NameParamsSchema
  },
  responses: {
    [httpStatus.OK]: jsonContent(
      user_selectSchema,
      'get user'
    ),
    [httpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found; 用户未找到'
    ),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NameParamsSchema), 
      'The validation error(s); 验证错误'
    ),
  }
}), async (c) => {
  const { name } = c.req.valid("param")
  const dbUser = await db.query.user_table.findFirst({
    where: (user, { eq }) => eq(user.name, name),
    with: {
      id_card_info: true, // 关联查询身份证信息
    }
  });
  if (!dbUser) {
    return c.json({ message: `User not found: ${name}` }, httpStatus.NOT_FOUND)
  }
  return c.json(dbUser, httpStatus.OK)
})

export const userMetaWithStatus_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable().optional(), // nullable -> 可以为 null, optional -> 可以不传(不传时为 undefined)
  image: z.string().nullable(),
  nickname: z.string().nullable().optional(),
  status: z.string()
})

export type UserMetaWithStatus = z.infer<typeof userMetaWithStatus_schema>

router.openapi(createRoute({
  tags: ['user'],
  path: '/users/status/{name}',
  method: 'get',
  request: {
    params: NameParamsSchema
  },
  responses: {
    [httpStatus.OK]: jsonContent(
      userMetaWithStatus_schema,
      'get user'
    ),
    [httpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found; 用户未找到'
    ),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NameParamsSchema), 
      'The validation error(s); 验证错误'
    ),
  }
}), async (c) => {
  const { name } = c.req.valid("param")
  const [dbUser] = await db.select({
    id: user_table.id,
    name: user_table.name,
    email: user_table.email,
    image: user_table.image,
    nickname: user_table.nickname,
    status: user_table.status,
  }).from(user_table).where(eq(user_table.name, name))

  if (!dbUser) {
    return c.json({ message: `User not found: ${name}` }, httpStatus.NOT_FOUND)
  }
  return c.json(dbUser, httpStatus.OK)
})

export default router