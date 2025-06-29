import { createRouter } from "~/lib/create-app";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import settings from "~/lib/settings";
import {  createJWT, verifyJWT } from "~/lib/core/token";
import { decode } from 'hono/jwt'

const router = createRouter()
// .openapi(createRoute({
//   tags: ['test'],
//   path: '/test',
//   method: 'get',
//   responses: {
//     [200]: {
//       description: 'test'
//     },
//     [401]: {
//       description: 'Unauthorized'
//     }
//   }
// }), async (c) => {
//   const ret = await testToken()
//   return c.json(
//     ret.body, ret.status
//   )
// })

function testSettings() {
  console.log("settings: ", settings)
  return settings
}
async function testToken() {
  const fakeData = {
    id: "1sdbdv-sdvryuh-ebe",
    "name": "test",
  }
  const fakeAccToken = await createJWT(fakeData)
  console.log("fakeAccToken: ", fakeAccToken)
  const fakeJWTPayload = await verifyJWT(fakeAccToken) // 测试正常情况
  console.log("fakeJWTPayload: ", fakeJWTPayload)

  // 测试篡改 token
  const { header: tokenHeader, payload: tokenPayload} = decode(fakeAccToken)
  console.log("tokenHeader: ", tokenHeader, "tokenPayload: ", tokenPayload)
  const tamperedData = { ...fakeData, name: "admin" }
  console.log("tamperedData: ", tamperedData)
  const tamperedPayload = Buffer.from(JSON.stringify(tamperedData)).toString('base64')
  console.log("tamperedPayload: ", tamperedPayload)
  const parts = fakeAccToken.split('.');
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  console.log("tamperedToken: ", tamperedToken)
  let tamperedJWTPayload
  try {
    tamperedJWTPayload = await verifyJWT(tamperedToken) // 对于验证不同过: 都报 401, 例如: 过期, 篡改, 等都是属于验证不通过, 以及 权限不足
    console.log("tamperedJWTPayload: ", tamperedJWTPayload)
  } catch (e: any) {
    const { header: tamperedTokenHeader, payload: tamperedTokenPayload} = decode(tamperedToken)
    console.log("tamperedJWTPayload error: ", e)
    console.log("tamperedTokenHeader: ", tamperedTokenHeader, "tamperedTokenPayload: ", tamperedTokenPayload)
    // 返回适当的错误响应
    if (e.name === 'TokenExpiredError') {
      return {body: {
        message: 'Unauthorized: Token has expired; 令牌已过期',
        error: e.message,
      }, status: 401}
    }else if (e.name === 'JwtTokenSignatureMismatched') {
      console.log("token 可能被篡改, 检测到token_payload为: ", tamperedTokenPayload)
      return {
        body:{
        message: 'Unauthorized: Token signature mismatched; 令牌签名不匹配',
        error: e.message,
      }, status: 401}
    } else {
      return {
        body:{
        message: 'Unauthorized: Token verification failed; 令牌验证失败',
        error: e.message,
      }, status: 401}
    }
  }
  return {
    status: 200,
    body: { fakeJWTPayload, tamperedJWTPayload },
  };
}


export default router