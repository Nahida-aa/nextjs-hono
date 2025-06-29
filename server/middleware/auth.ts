import { Context, MiddlewareHandler, Next } from 'hono'
// import { Context, Next } from "@hono/zod-openapi";
import { getCookie } from 'hono/cookie'
import { verifyJWT } from '~/lib/core/token'
import { Session } from 'next-auth'
import { json } from 'stream/consumers'
import httpStatus from "~/lib/http-status-codes"
import { StatusCode } from 'hono/utils/http-status'

export type SessionTokenPayload = {
  user?: {
    id: string;
    name: string;
    email?: string;
    image: string;
    nickname?: string;
  };
  scopes?: string[];
  exp?: number;
  /**
   * The token is checked to ensure it is not being used before a specified time.
   */
  nbf?: number;
  /**
   * The token is checked to ensure it is not issued in the future.
   */
  iat?: number;
}

export async function get_session_token_payload(c: Context) {
  const authHeader = c.req.header('Authorization')
  let token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    token = getCookie(c, 'session_token')
  }
  if (!token) {
    return null
  }
  // console.log('get_session_token_payload::token:', token)
  return verifyJWT(token) as SessionTokenPayload
}

export async function get_session_token_payload_and_res(c: Context): Promise<
{ session_token_payload: SessionTokenPayload, success: true } | {
  json_body: { message: string }, status: 401, success: false }
> {
  try {
    const session_token_payload = await get_session_token_payload(c)
    if (!session_token_payload) {
      return {
        json_body: { message: 'Authentication required' },
        status: httpStatus.UNAUTHORIZED, success: false
      }
    }
    // console.log('get_session_token_payload_and_res::session_token_payload:', session_token_payload)
    return { session_token_payload, success: true }
  } catch (error) {
    return {
      json_body: { message: 'token verification failed' },
      status: httpStatus.UNAUTHORIZED, success: false
    }
  }
}

export async function get_current_user_and_res(c: Context): Promise<
{ user: NonNullable<SessionTokenPayload['user']>, success: true } | {
  json_body: { message: string }, status: 401, success: false }
> {
  const session_token_payload_ret = await get_session_token_payload_and_res(c)
  if (!session_token_payload_ret.success) return session_token_payload_ret
  const payload = session_token_payload_ret.session_token_payload
  if (!payload?.user) {
    return {
      json_body: { message: 'Unauthorized: 未登录' },
      status: httpStatus.UNAUTHORIZED , success: false
    }
  }
  return { user: payload.user, success: true }
}

export async function getSessionTokenPayload_Middleware(c: Context, next: Next) {
  let payload = null
  try {
    payload = await get_session_token_payload(c)
  } catch (error) {
    return c.json({ message: 'token verification failed' }, 401)
  }
  if (!payload) {
    return c.json({ message: 'Authentication required' }, 401)
  }
  c.set('session_token_payload', payload)
  await next()
}

