import { createRouter } from "~/lib/create-app";
import NameParamsSchema from "~/lib/openapi/schemas/name-params";
import { createRoute, z } from "@hono/zod-openapi";
// import httpStatus from "~/lib/http-status-codes"
import httpStatus from "~/lib/http-status-codes"
import jsonContent from "~/lib/openapi/helpers/json-content";
import { eq, is, sql } from "drizzle-orm";
import { get_current_user_and_res, get_session_token_payload, get_session_token_payload_and_res } from "~/lib/middleware/auth";
import { db } from "~/lib/db";
import { user_table } from "~/lib/db/schema/user";
// import { linkGroupFollow, linkUserFollow } from "~/server/db/schema/link";
import { createSelectSchema } from "drizzle-zod";
import { user_meta_schema } from "~/lib/schema/user";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { offset_limit_query_schema } from "~/lib/schema/query";
import jsonContentOneOf from "~/lib/openapi/helpers/json-content-one-of";
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import { string } from "zod";
import { group_meta_schema } from "~/lib/schema/group";
import { group_table } from "~/lib/db/schema/group";
import { follow_table } from "~/lib/db/schema/follow";

const followers_out_schema = z.object({
  followers: z.array(z.object({
    created_at: z.string(),
    user: user_meta_schema,
  })),
  count: z.number(),
})
const user_meta_schema_with_followInfo = user_meta_schema.extend({
  self_is_following: z.boolean(),
  is_following_self: z.boolean(),
})
const followers_withAuth_out_schema = z.object({
  followers: z.array(
    z.object({
      created_at: z.string(),
      user: user_meta_schema_with_followInfo,
    })
  ),
  count: z.number(),
})

const followings_out_schema = z.object({
  followings: z.array(z.object({
    created_at: z.string(),
    target_type: string().openapi({ example: 'user' }), // user, group
    q_user: user_meta_schema.nullable(),
    target_group: group_meta_schema.nullable(),
  })),
  count: z.number(),
})
const group_meta_schema_with_followInfo = group_meta_schema.extend({
  self_is_following: z.boolean(),
  is_following_self: z.boolean().default(false), // 由于 group 没有关注功能, 所以这个字段在 type 为 group 时, 为 false
})
const followings_withAuth_out_schema = z.object({
  followers: z.array(
    z.object({
      created_at: z.string(),
      type: string().openapi({ example: 'user' }), // user | group
      user: user_meta_schema_with_followInfo.nullable(),
      group: group_meta_schema_with_followInfo.nullable(),
    })
  ),
  count: z.number(),
})

const router = createRouter()

// .openapi(createRoute({
//   tags: ['follow'],
//   description: `用于未登录用户获取某个用户的粉丝列表`,
//   path: '/users/{name}/followers',
//   method: 'get',
//   request: {
//     params: NameParamsSchema,
//     query: offset_limit_query_schema,
//   },
//   responses: {
//     [httpStatus.OK]: jsonContent(followers_out_schema, 'List of followers'),
//     [httpStatus.UNPROCESSABLE_ENTITY]: jsonContentOneOf([createErrorSchema(NameParamsSchema), createErrorSchema(offset_limit_query_schema)], 'The validation error(s); 输入参数验证错误'),
//     [httpStatus.NOT_FOUND]: jsonContent(createMessageObjectSchema('User not found'), 'User not found'),
//     [httpStatus.INTERNAL_SERVER_ERROR]: jsonContent(createMessageObjectSchema('Internal Server Error'), 'Internal Server Error'),
//   }
// }), async (c) => {
//   const { name: target_name } = c.req.valid("param")
//   const { offset, limit } = c.req.valid("query")
//   console.log('offset', offset, 'limit', limit)
//   const q_user = await db.query.user.findFirst({
//     where: eq(user_table.name, target_name),
//   })
//   if (!q_user) {
//     return c.json({ message: 'User not found' }, httpStatus.NOT_FOUND)
//   }
//   let followers = []
//   try {
//     followers = await db.query.linkUserFollow.findMany({
//       columns: {
//         created_at: true,
//       },
//       where: eq(linkUserFollow.q_user_id, q_user.id),
//       with: {
//         user: {
//           columns: {
//             id: true,
//             name: true,
//             nickname: true,
//             email: true,
//             image: true,
//           },
//         },
//       }, offset,limit,
//     })
//   } catch (error) {
//     console.error('error', error)
//     return c.json({ message: 'Internal Server Error' }, httpStatus.INTERNAL_SERVER_ERROR)
//   }
//   return c.json({ followers: followers,
//     count: q_user.followers_count,
//   }, httpStatus.OK)
// }
// )

// .openapi(createRoute({
//   tags: ['follow'],
//   description: `
//   - 需要登录(携带 BearerAuth 或者 自动携带的 cookie), 负责返回 401, 对于非登录用户请使用 /api/hono/users/{name}/followers\n- 获取目标用户(name)的粉丝列表\n- 携带 自己是否关注目标用户的粉丝, 以及目标用户的粉丝是否关注自己\n- self_is_following: 自己是否关注目标用户的粉丝\n- is_following_self: 目标用户的粉丝是否关注自己\n`,
//   path: '/user/{name}/followers',
//   method: 'get',
//   // security: [{ cookieAuth: [] }, { BearerAuth: [] }],
//   request: {
//     params: NameParamsSchema,
//     query: offset_limit_query_schema,
//   },
//   responses: {
//     [httpStatus.OK]: jsonContent(followers_withAuth_out_schema, 'List of followers'),
//     [httpStatus.UNPROCESSABLE_ENTITY]: jsonContentOneOf([createErrorSchema(NameParamsSchema), createErrorSchema(offset_limit_query_schema)], 'The validation error(s); 输入参数验证错误'),
//     [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema('Unauthorized'), 'Unauthorized'),
//     [httpStatus.NOT_FOUND]: jsonContent(createMessageObjectSchema('User not found'), 'User not found'),
//   }
// }), async (c) => {
//   const { name: target_name } = c.req.valid("param")
//   const { offset, limit } = c.req.valid("query")

//   let payload = null
//   try {
//     payload = await get_session_token_payload(c)
//   } catch (error) {
//     return c.json({ message: `Unauthorized: token可能被篡改`, error }, httpStatus.UNAUTHORIZED)
//   }
//   if (!payload?.user?.name) {
//     return c.json({ message: 'Unauthorized: 未登录' }, httpStatus.UNAUTHORIZED)
//   }
  
//   const current_user = await db.query.user.findFirst({
//     where: eq(user_table.name, payload.user.name),
//   })
//   if (!current_user) {
//     return c.json({ message: `Unauthorized: 没有当前用户: name: ${payload.user.name}; id:, ${payload.user.id}` }, httpStatus.UNAUTHORIZED)
//   }

//   const q_user = await db.query.user.findFirst({
//     where: eq(user_table.name, target_name),
//   })
//   if (!q_user) {
//     return c.json({ message: 'User not found' }, httpStatus.NOT_FOUND)
//   }

//   const followers = await db.query.linkUserFollow.findMany({
//     columns: {
//       created_at: true,
//     },
//     where: eq(linkUserFollow.q_user_id, q_user.id),
//     with: {
//       user: {
//         columns: {
//           id: true,
//           name: true,
//           nickname: true,
//           email: true,
//           image: true,
//         },
//         extras: {
//           self_is_following: sql<boolean>`CASE WHEN ${linkUserFollow.user_id} = ${current_user.id} THEN true ELSE false END`.as('self_is_following'),
//           is_following_self: sql<boolean>`CASE WHEN ${linkUserFollow.q_user_id} = ${current_user.id} THEN true ELSE false END`.as('is_following_self'),
//         }
//       },
//     }, offset, limit
//   });
//   return c.json({ followers: followers,
//     count: q_user.followers_count,
//   }, httpStatus.OK)
// }
// )

// .openapi(createRoute({
//   tags: ['follow'],
//   description: `用于未登录用户获取某个用户的关注列表`,
//   path: '/users/{name}/followings',
//   method: 'get',
//   request: {
//     params: NameParamsSchema,
//     query: offset_limit_query_schema,
//   },
//   responses: {
//     [httpStatus.OK]: jsonContent(followings_out_schema, 'List of following users'),
//     [httpStatus.UNPROCESSABLE_ENTITY]: jsonContentOneOf([createErrorSchema(NameParamsSchema), createErrorSchema(offset_limit_query_schema)], 'The validation error(s); 输入参数验证错误'),
//     [httpStatus.NOT_FOUND]: jsonContent(createMessageObjectSchema('User not found'), 'User not found'),
//     [httpStatus.INTERNAL_SERVER_ERROR]: jsonContent(createMessageObjectSchema('Internal Server Error'), 'Internal Server Error'),
//   }
// }), async (c) => {
//   const { name } = c.req.valid("param");
//   const { offset, limit } = c.req.valid("query");

//   const user = await db.query.user.findFirst({
//     where: eq(user_table.name, name),
//   });
//   if (!user) {
//     return c.json({ message: 'User not found' }, httpStatus.NOT_FOUND);
//   }

//   try {
//     const followings = await db.query.follow_table.findMany({
//       columns: {
//         created_at: true,
//         target_type: true,
//       },
//       where: eq(follow_table.follower_id, user.id),
//       with: {
//         q_user: {
//           columns: {
//             id: true,
//             name: true,
//             nickname: true,
//             email: true,
//             image: true,
//           },
//         },
//         target_group: {
//           columns: {
//             id: true,
//             name: true,
//             nickname: true,
//             email: true,
//             image: true,
//           },
//         },
//       },
//       offset,
//       limit,
//     });
    
//     return c.json({
//       followings: followings,
//       count: user.following_count,
//     }, httpStatus.OK);
//   } catch (error) {
//     console.error('error', error);
//     return c.json({ message: 'Internal Server Error' }, httpStatus.INTERNAL_SERVER_ERROR);
//   }
// })

// .openapi(createRoute({
//   tags: ['follow'],
//   description: `
//   - 需要登录(携带 BearerAuth 或者 自动携带的 cookie), 负责返回 401, 对于非登录用户请使用 /api/hono/users/{name}/followings
//   - 获取目标用户(name)的关注列表
//   - 携带目标用户关注的用户是否关注自己
//   - is_following_self: 目标用户关注的用户是否关注自己
//   `,
//   path: '/user/{name}/followings',
//   method: 'get',
//   // security: [{ cookieAuth: [] }, { BearerAuth: [] }],
//   request: {
//     params: NameParamsSchema,
//     query: offset_limit_query_schema,
//   },
//   responses: {
//     [httpStatus.OK]: jsonContent(followings_withAuth_out_schema, 'List of following users'),
//     [httpStatus.UNPROCESSABLE_ENTITY]: jsonContentOneOf([createErrorSchema(NameParamsSchema), createErrorSchema(offset_limit_query_schema)], 'The validation error(s); 输入参数验证错误'),
//     [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema('Unauthorized'), 'Unauthorized'),
//     [httpStatus.NOT_FOUND]: jsonContent(createMessageObjectSchema('User not found'), 'User not found'),
//   }
// }), async (c) => {
//   const { name: target_name } = c.req.valid("param");
//   const { offset, limit } = c.req.valid("query");

//   const CU_ret = await get_current_user_and_res(c)
//   if (!CU_ret.success) return c.json(CU_ret.json_body, CU_ret.status)
//   const current_user = CU_ret.user

//   const q_user = await db.query.user.findFirst({
//     where: eq(user_table.name, target_name),
//   });
//   if (!q_user) {
//     return c.json({ message: 'User or group not found' }, httpStatus.NOT_FOUND);
//   }

//   const following = await db.query.follow_table.findMany({
//     columns: {
//       created_at: true,
//       target_type: true,
//     },
//     where: eq(follow_table.follower_id, q_user.id),
//     with: {
//       target_user: {
//         columns: {
//           id: true,
//           name: true,
//           nickname: true,
//           email: true,
//           image: true,
//         },
//         extras: {
//           is_following_self: sql<boolean>`EXISTS (
//             SELECT 1 FROM ${follow_table} AS luf
//             WHERE luf.follower_id = ${follow_table.target_id}
//             AND luf.id = ${current_user.id}
//           )`.as('is_following_self'),
//         }
//       },
//     },
//     offset,
//     limit,
//   });

//   return c.json({
//     followings: following.map(f => ({ created_at: f.created_at, user: f.target_user })),
//     count: q_user.following_count,
//   }, httpStatus.OK);
// })


export default router