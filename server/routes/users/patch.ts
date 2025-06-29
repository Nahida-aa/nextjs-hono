import httpStatus from "~/lib/http-status-codes"
import { db } from "~/lib/db";
import { user_insertSchema, user_patchSchema, user_selectSchema } from "~/lib/schema/userBy";
import { createRouter } from "~/lib/create-app";
import jsonContent from "~/lib/openapi/helpers/json-content";
import { createRoute, z } from "@hono/zod-openapi";
import { hash } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import { user_table, idCardInfo_table, User} from "~/lib/db/schema/user"
import IdUUIDParamsSchema from "~/lib/openapi/schemas/id-uuid-params";
import { notFoundSchema } from "~/lib/constans";
import jsonContentOneOf from "~/lib/openapi/helpers/json-content-one-of";
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import NameParamsSchema from "~/lib/openapi/schemas/name-params";
import exp from "constants";

const userPatchApiSchema = z.object({
  inUser: user_patchSchema,
  csrfToken: z.string().optional().openapi({ example: 'csrfToken' }),
})

const router = createRouter()

.openapi(createRoute({
  tags: ['user'],
  method: 'patch',path: '/users/{id}',
  // security: [{ OAuth2PasswordBearer: [] }],
  request: {
    params: IdUUIDParamsSchema,
    headers: z.object({
      Authorization: z.string().nullable().openapi({ example: 'Bearer session_token' }),
      // Cookie: z.string().nullable().openapi({ example: 'sessionToken=sessionToken;csrfToken=csrfToken' }),
    }),
    cookies: z.object({
      sessionToken: z.string().nullable().openapi({ example: 'session_token' }),
      csrfToken: z.string().nullable().openapi({ example: 'csrf_token'}),
    }),
    body: jsonContent(
      userPatchApiSchema,
      'update user'
    )
  },
  responses: {
    [httpStatus.OK]: jsonContent(
      user_selectSchema,
      'updated user'
    ),
    [httpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found; 用户未找到'
    ),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(userPatchApiSchema), createErrorSchema(IdUUIDParamsSchema), ],
      'The validation error(s); 验证错误'
    ),
    [httpStatus.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema('Authentication required'),
      'Authentication required; 未授权'
    ),
  }
}), async (c) => {
  const { id } = c.req.valid("param")
  const {inUser, csrfToken} = c.req.valid("json")
  const { id_card_info: inIdCardInfo, ...userData } = inUser;
  let hashPassword // 密码加密
  if (inUser.password){
    hashPassword = await hash(inUser.password, 10)
    userData.password = hashPassword
  }
  return await db.transaction(async (tx) => {
    // Update user
    const [updatedUser] = await tx.update(user_table)
      .set(userData)
      .where(eq(user_table.id, id))
      .returning();

    if (!updatedUser) {
      return c.json({ message: 'User not found' }, httpStatus.NOT_FOUND);
    }

    let updatedIdCardInfo
    if (inIdCardInfo) {
      // Check if idCardInfo exists
      const existingIdCardInfo = await tx.query.idCardInfo_table.findFirst({
        where: eq(idCardInfo_table.user_id, id)
      });

      if (existingIdCardInfo) {
        // Update existing idCardInfo
        [updatedIdCardInfo] = await tx.update(idCardInfo_table)
          .set(inIdCardInfo)
          .where(eq(idCardInfo_table.user_id, id))
          .returning();
      } else {
        // Insert new idCardInfo
        [updatedIdCardInfo] = await tx.insert(idCardInfo_table)
          .values({ ...inIdCardInfo, user_id: id })
          .returning();
      }
    }

    // Fetch the complete updated user data including ID card info
    // const [completeUser] = await tx.select()
    //   .from(userTable)
    //   .leftJoin(idCardInfoTable, eq(userTable.id, idCardInfoTable.user_id))
    //   .where(eq(userTable.id, id));

    return c.json({
      // ...completeUser.User,
      // idCardInfo: completeUser.IDCardInfo
      ...updatedUser,
      id_card_info: updatedIdCardInfo
    }, httpStatus.OK);
  });
})

.openapi(createRoute({
  tags: ['user'],
  method: 'patch', path: '/users/name/{name}',
  request: {
    params: NameParamsSchema,
    body: jsonContent(
      user_patchSchema,
      'update user'
    )
  },
  responses: {
    [httpStatus.OK]: jsonContent(
      user_selectSchema,
      'updated user'
    ),
    [httpStatus.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found; 用户未找到'
    ),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(user_patchSchema), createErrorSchema(NameParamsSchema), ],
      'The validation error(s); 验证错误'
    ),
  }
}), async (c) => {
  const { name } = c.req.valid("param")
  const inUser = c.req.valid("json")
  const { id_card_info: inIdCardInfo, ...userData } = inUser;
  let hashPassword // 密码加密
  if (inUser.password){
    hashPassword = await hash(inUser.password, 10)
    userData.password = hashPassword
  }
  return await db.transaction(async (tx) => {
    // Update user
    const [updatedUser] = await tx.update(user_table)
      .set(userData)
      .where(eq(user_table.name, name))
      .returning();

    if (!updatedUser) {
      return c.json({ message: 'User not found' }, httpStatus.NOT_FOUND);
    }

    let updatedIdCardInfo;
    if (inIdCardInfo) {
      // Check if idCardInfo exists
      const existingIdCardInfo = await tx.query.idCardInfo_table.findFirst({
        where: eq(idCardInfo_table.user_id, updatedUser.id)
      });

      if (existingIdCardInfo) {
        // Update existing idCardInfo
        [updatedIdCardInfo] = await tx.update(idCardInfo_table)
          .set(inIdCardInfo)
          .where(eq(idCardInfo_table.user_id, updatedUser.id))
          .returning();
      } else {
        // Insert new idCardInfo
        [updatedIdCardInfo] = await tx.insert(idCardInfo_table)
          .values({ ...inIdCardInfo, user_id: updatedUser.id })
          .returning();
      }
    }

    return c.json({
      ...updatedUser,
      id_card_info: updatedIdCardInfo
    }, httpStatus.OK);
  });
})

export default router