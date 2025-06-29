import { Hono } from 'hono'
import { handle } from 'hono/vercel'
export const dynamic = 'force-dynamic'
// export const runtime = 'edge'
// export const runtime = "nodejs";
import configOpenAPI from '~/lib/conf-openapi'
import createApp, { createRouter } from '~/lib/create-app'
// import { logger } from 'hono-pino'; // pnpm add hono-pino pino

import test from '~/lib/routes/test/index'
import auth from '~/lib/routes/auth/index'
import users from '~/lib/routes/users/route'
// import users_get from '~/server/routes/users/get'
import user from '~/lib/routes/user/route'
import groups from '~/lib/routes/groups/route'
import follow from '~/lib/routes/follow/route'
import friend from '~/lib/routes/friend/route'
import chats from '~/lib/routes/chats/route'
import project from '~/lib/routes/project/route'
import upload from '~/lib/routes/upload/route'

// const app = new Hono().basePath('/api/hono')
// const app = new OpenAPIHono().basePath('/api/hono')
const app = createApp()

// 使用 hono-pino 中间件进行日志记录
// app.use('*', logger());

const routes = [
  test,
  auth,
  users,
  // users_get,
  user,
  groups,
  follow,
  friend,
  chats,
  project,
  upload,
] as const;

configOpenAPI(app)

routes.forEach(route => {
  app.route("/", route)
})

// const _app = app
//   .route("/", user)
//   .route("/", login)

// type PrintRoutesParams = typeof app;
// export function printRoutes(app: PrintRoutesParams) {
// export function printRoutes(app: OpenAPIHono<any, any, "*">) {
//   const routes = app.routes;
//   routes.forEach((route: any) => {
//     console.log(`${route.method.toUpperCase()} ${route.path}`);
//   });
// }
// console.log('Routes:');
// printRoutes(app);

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app);
export const DELETE = handle(app);
// export const OPTIONS = handle(app);

// const handler = handle(app);

// export const GET = handler;
// export const POST = handler;
// export const PATCH = handler;
// export const PUT = handler;
// export const OPTIONS = handler;

export type AppType = typeof routes[number];
// export type AppTypes = typeof _app;