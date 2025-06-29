import settings from "~/lib/settings"
import { sign, verify } from "hono/jwt"

/** Web compatible method to create a hash, using SHA256 */
export async function createHash(message: string) {
  const data = new TextEncoder().encode(message)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toString()
}

/** Web compatible method to create a random string of a given length */
export function randomString(size: number) {
  const i2hex = (i: number) => ("0" + i.toString(16)).slice(-2)
  const r = (a: string, i: number): string => a + i2hex(i)
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  return Array.from(bytes).reduce(r, "")
}

export async function createCSRFToken() {
  // New CSRF token
  const csrfToken = randomString(32)
  const csrfTokenHash = await createHash(`${csrfToken}${settings.SECRET_KEY}`)
  const csrfCookie = `${csrfToken}|${csrfTokenHash}`

  return { csrfCookie, csrfToken }
}

const alg = "HS256"

export const createJWT = async (data: object, expires_delta: number|null = null) => {
  if (expires_delta === null) {
    expires_delta = settings.SESSION_TOKEN_EXPIRE_MINUTES * 60
  }
  const payload = { ...data, exp: Math.floor(Date.now()) + expires_delta }
  return await sign(payload, settings.SECRET_KEY, alg)
}

// 用于验证是否被篡改, 返回 payload
export const verifyJWT = async (token: string) => {
  return await verify(token, settings.SECRET_KEY, alg)
}