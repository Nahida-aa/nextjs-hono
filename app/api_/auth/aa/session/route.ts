import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import { verifyJWT } from "~/lib/core/token";

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