import NextAuth from 'next-auth';

import { authConfig } from '~/app/(auth)/auth.config';
import { NextResponse, type NextRequest } from 'next/server';

import { auth, server_auth } from "~/app/(auth)/auth";


export default auth(middleware)

// export default NextAuth(authConfig).auth;
async function middleware(
  req: NextRequest,
) {
  console.log(`app/(auth)/middleware.ts: middleware: req: ${JSON.stringify(req)}`);
  const rUrl =req.url
  console.log(`app/(auth)/middleware.ts: middleware: rUrl: ${rUrl}`);
  const session = await server_auth();
  if (session) {
    console.log(`app/(auth)/middleware.ts: middleware: session: ${JSON.stringify(session)}`);
    const res = NextResponse.next()
    res.cookies.set('name', session.user.name,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    return res;
  } else if (needAuthPaths.some((path) => rUrl.startsWith(path))) {
    if (!session) return NextResponse.redirect(new URL('/sign-in', req.url));
  }  
  console.log(`app/(auth)/middleware.ts: middleware: session: ${JSON.stringify(session)}`);
  return NextResponse.next();
}
// export default middleware;

const needAuthPaths = [
  '/user/status',  '/user/friend/add', '/api/uploadthing'
]

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },

    // {
    //   source:
    //     '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    //   has: [
    //     { type: 'header', key: 'next-router-prefetch' },
    //     { type: 'header', key: 'purpose', value: 'prefetch' },
    //   ],
    // },

    // {
    //   source:
    //     '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    //   has: [{ type: 'header', key: 'x-present' }],
    //   missing: [{ type: 'header', key: 'x-missing', value: 'prefetch' }],
    // },
  ],
}
