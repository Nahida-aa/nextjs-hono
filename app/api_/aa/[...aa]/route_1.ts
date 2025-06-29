// import { NextRequest, NextResponse } from "next/server"
// import { AuthAction, RequestInternal } from "../types";
// import { act } from "react";
// import { isAuthAction } from "../actions";

// export interface AaConfig {
//   secret?: string
//   basePath?: string
// }
// export const aaConfig = {
// } satisfies AaConfig;

// export function AaNextAuth(config: AaConfig) {
//   const httpHandler = (req: NextRequest) => AaAuth(reqWithEnvURL(req), config)
//   return {
//     handlers: { GET: httpHandler, POST: httpHandler } as const
//   }
// }
// export function setEnvDefaults(config: AaConfig) {
//   try {
//     config.secret ??= process.env.AUTH_SECRET
//   } catch {
//     // Catching and swallowing potential URL parsing errors, we'll fall
//     // back to `/api/auth` below.
//   } finally {
//     config.basePath ||= "/api/aa"
//   }
// }
// export function reqWithEnvURL(req: NextRequest): NextRequest {
//   // const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL
//   // if (!url) return req
//   const url = new URL(req.url)
//   console.log(`reqWithEnvURL::url: ${url}`)
//   const { origin: envOrigin } = new URL(url)
//   console.log(`reqWithEnvURL::envOrigin: ${envOrigin}`)
//   const { href, origin } = req.nextUrl
//   console.log(`reqWithEnvURL::href: ${href}, origin: ${origin}, envOrigin: ${envOrigin}`)
//   return new NextRequest(href.replace(origin, envOrigin), req)
// }
// export async function AaAuth(
//   request: Request,
//   config: AaConfig
// ): Promise<Response> {
//   const internalRequest = await toInternalRequest(request, config)
//   // There was an error parsing the request; 分析出: 不是预先提供的请求
//   if (!internalRequest) return Response.json(`Bad request.`, { status: 400 })

//   const isRedirect = request.headers?.has("X-Auth-Return-Redirect")
//   // const res = await AuthInternal(req, config)
//   // return toResponse(res)
//   return Response.json({ internalRequest, config })
// }

// export async function toInternalRequest(req: Request,
//   config: AaConfig
// ): Promise<RequestInternal | undefined> {
//   try {
//     if (req.method !== "GET" && req.method !== "POST")
//       throw new Error("Only GET and POST requests are supported")
//     config.basePath ??= "/aa" // 如果config.basePath为undefined, 则设置为"/aa"
//     console.log(`toInternalRequest::config.basePath: ${config.basePath}`)
//     const url = new URL(req.url)

//     const { action, providerId } = parseActionAndProviderId(
//       url.pathname,
//       config.basePath
//     )

//     return {
//       url,
//       action,
//       providerId,
//       method: req.method,
//       headers: Object.fromEntries(req.headers),
//       // body: req.body ? await getBody(req) : undefined,
//       // cookies: parseCookie(req.headers.get("cookie") ?? "") ?? {},
//       error: url.searchParams.get("error") ?? undefined,
//       query: Object.fromEntries(url.searchParams),
//     }
//   } catch (e) {
//     console.log(e)
//   }
// }

// export function parseActionAndProviderId(
//   pathname: string,
//   base: string
// ): {
//   action: AuthAction
//   // action: string
//   providerId?: string
// } {
//   const a = pathname.match(new RegExp(`^${base}(.+)`))
//   if (a === null) throw new Error(`Cannot parse action at ${pathname}`)
//   const actionAndProviderId = a.at(-1)!
//   const b = actionAndProviderId.replace(/^\//, "").split("/").filter(Boolean)
//   if (b.length !== 1 && b.length !== 2) throw new Error(`Cannot parse action at ${pathname}`)
//   const [action, providerId] = b
//   if (!isAuthAction(action)) throw new Error(`Invalid action ${action}`)
//   if (
//     providerId &&
//     !["signin", "callback", "webauthn-options"].includes(action)
//   ) { throw new Error(`Invalid providerId ${providerId}`) }
//   return { action , providerId }
// }
// export async function GET(req: NextRequest,
//   { params }: { params: { aa: string[] } }
// ) {
//   const aa = (await params).aa
//   const req_aa =  req.nextUrl.searchParams.get('aa') || '';
//   const url = new URL(req.url)
//   const { origin: envOrigin } = new URL(url)
//   const { href, origin } = req.nextUrl
//   const href2 = href.replace(origin, envOrigin)
//   const newQ =  new NextRequest(href.replace(origin, envOrigin), req)
//   let config = aaConfig
//   const url_name = url.pathname
//   const { action , providerId } =  parseActionAndProviderId(url.pathname, "/api/aa")
//   console.log(`GET::config: ${config}`)
//   const {
//     handlers: { GET, POST }
//   } = await AaNextAuth(config)
//   console.log(`GET::.AaNextAuth`)
//   return NextResponse.json({ aa, req_aa, url, envOrigin,href,origin, href2, newQ,url_name, 
//     action, providerId 
//   })
// }

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ aa: string[] }> }
// ) {
//   console.log(`POST::req: ${req}`)
//   const aa = (await params).aa
//   const req_aa =  req.nextUrl.searchParams.get('aa') || '';
//   const url = new URL(req.url)
//   const { origin: envOrigin } = new URL(url)
//   let config = aaConfig
//   console.log(`GET::config: ${config}`)
//   const {
//     handlers: { GET, POST }
//   } = await AaNextAuth(config)
//   console.log(`GET::.AaNextAuth`)
//   return NextResponse.json({ aa, req_aa, url, envOrigin })
// }