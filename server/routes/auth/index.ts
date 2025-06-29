import { decode } from 'hono/jwt'
import { createRouter } from "~/lib/create-app";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import settings from "~/lib/settings";
import { verifyJWT } from "~/lib/core/token";
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import jsonContent from '~/lib/openapi/helpers/json-content';
import { createCSRFToken } from '~/lib/core/token';

import register_route from './register'
import session_route from './session'
import login_route from './login'
import logout_route from './logout'

const router = createRouter()
.openapi(createRoute({
  tags: ['auth'],
  path: '/auth/csrf',
  method: 'get',
  summary: '获取 csrfToken',
  description: ` 用于在 需要csrfToken的请求前先获取 csrfToken, 会在两个header和body中返回 csrfToken, header中的是不可读的, body中的是可读的, 用于前端在请求体中携带csrfToken

  需要csrfToken的请求: 
  - /api/hono/register
  - /api/hono/login
  - /api/hono/logout
  - /api/hono/auth/signup
  - /api/hono/auth/signin
  - /api/hono/auth/signout

  后面三个我没做哈, 因为和前面三个是一样的功能`,
  responses: {
    [200]: jsonContent(
      z.object({
        csrfToken: z.string()
      }),
      '已响应 CSRF token, 并将hash后的csrfToken放到 cookie 中'
    )
  }
}), async (c) => {
  const { csrfCookie, csrfToken } = await createCSRFToken()
  setCookie(c, 'csrfToken', csrfCookie, {
    httpOnly: true,
    sameSite: 'strict',
  })
  return c.json({
    csrfToken
  })
})

router.route('', register_route)
router.route('', session_route)
router.route('', login_route)
router.route('', logout_route)

export default router