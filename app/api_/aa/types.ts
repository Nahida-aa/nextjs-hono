export type AuthAction =
  | "callback"
  | "csrf"
  | "error"
  | "providers"
  | "session"
  | "signin"
  | "signout"
  | "verify-request"
  | "webauthn-options"
  
export interface RequestInternal {
  url: URL
  method: "GET" | "POST"
  cookies?: Partial<Record<string, string>>
  headers?: Record<string, any>
  query?: Record<string, any>
  body?: Record<string, any>
  action: AuthAction
  providerId?: string
  error?: string
}