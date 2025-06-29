import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import { verifyJWT } from "~/lib/core/token";
// import { user } from "~/server/db/schema/user";

/**
 *@swagger
 * /api/user: 
 *  get:
 *    tags: [user]
 *    summary: 读取用户自己的详细, 需要在登录状态
 *    security: [{ OAuth2PasswordBearer: [] }]
 *    parameters: 
 *      - in: header
 *        name: Authorization
 *        required: false
 *        schema:
 *          type: string
 *          nullable: true
 *          example: Bearer sessionToken 
 *        description: Bearer sessionToken
 *      - in: cookie
 *        name: sessionToken
 *        required: false
 *        schema:
 *          oneOf:
 *            - type: string
 *            - type: null
 *          nullable: true
 *          example: sessionToken
 *          title: title sessionToken
 *        description: 浏览器在同域下会自动携带, 且客户端本身无法获取
 *    responses:
 *      200:
 *        description: 用户自己的详细信息
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserPublic' 
 */
export async function GET(req: NextRequest) {
  const headersObj = await headers()
  const Authorization = headersObj.get('Authorization')
  let session_token = null
  if (!Authorization) {
    const cookieStore = await cookies()
    session_token = cookieStore.get('session_token')?.value 
  } else {
    session_token = Authorization.split(" ")[1];
  }
  if (!session_token) {
    return NextResponse.json({ message: '未授权, 请登录' }, { status: 401 });
  } else {
    console.log('session_token', session_token)
    const JWTPayload = await verifyJWT(session_token as string)
    console.log('JWTPayload', JWTPayload)
    const authSession = {
      user: {
        id: JWTPayload.id,
        email: JWTPayload.email,
        name: JWTPayload.name,
        image: JWTPayload.image,
        nickname: JWTPayload.nickname
      },
      scopes: []
    }
    return NextResponse.json(authSession);
  }
}