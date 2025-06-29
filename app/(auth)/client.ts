"use client"

export async function client_sign_out( 
    options
    :  { redirectTo?: string
      redirect?: boolean }={ redirect: true}
) {
  const redirectTo = options.redirectTo ?? window.location.href // 没有设置 redirectTo 时默认为当前页面
  // const baseUrl = "https://api.nahida-aa.us.kg/api/py/auth"
  // const baseUrl = "http://127.0.0.1:8000/api/py/auth"
  const baseUrl = "/api/py/auth"
  const csrfToken = await getPyCsrfToken(baseUrl)
  console.log(`signOut::csrfToken: ${csrfToken}`)
  const res = await fetch(`${baseUrl}/signout`, {
    method: "post",
    credentials: 'include', // 携带 cookie
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({ csrfToken, redirectTo: redirectTo }),
  })
  if (!res.ok) {
    throw new Error("Failed to sign out")
  }
  const data = await res.json() // { url: redirectTo }
  console.log(`signOut::data: ${data}`)
  // broadcast().postMessage({ event: "session", data: { trigger: "signout" } })
  if (options?.redirect ?? true) {
    const url = data.url ?? redirectTo
    window.location.href = url
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes("#")) window.location.reload()
    //  "at" ts-expect-error
    return
  }
  return data
  // return signOut(options)
}
export async function getPyCsrfToken(baseUrl: string): Promise<string> {
  const res = await fetch(`${baseUrl}/csrf`, {
    credentials: "include",
  })
  const data = await res.json()
  return data?.csrfToken ?? "" 
}


export async function client_logout( 
  options
  :  { redirectTo?: string
    redirect?: boolean }={ redirect: true}
) {
  const redirectTo = options.redirectTo ?? window.location.href // 没有设置 redirectTo 时默认为当前页面
  const baseUrl = "/api/hono/auth"
  const csrfToken = await getPyCsrfToken(baseUrl)
  console.log(`signOut::csrfToken: ${csrfToken}`)
  const body = JSON.stringify({ csrfToken, redirectTo: redirectTo })
  const res = await fetch(`${baseUrl}/logout`, {
    method: "post",
    // credentials: 'include', // 携带 cookie
    headers: {
      "Content-Type": "application/application/json",
      // "X-Auth-Return-Redirect": "1",
    },
    body: body,
    // new URLSearchParams({ csrfToken, redirectTo: redirectTo }),
  })
  if (!res.ok) {
    throw new Error("Failed to sign out")
  }
  const data = await res.json() // { url: redirectTo }
  console.log(`signOut::data: ${data}`)
  // broadcast().postMessage({ event: "session", data: { trigger: "signout" } })
  if (options?.redirect ?? true) {
    const url = data.url ?? redirectTo
    window.location.href = url
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes("#")) window.location.reload()
    //  "at" ts-expect-error
    return
  }
  return data
}

export async function client_logout_soft(
  options: { redirectTo?: string; redirect?: boolean } = { redirect: true }
) {
  document.cookie = "logged_in=no; path=/;"; // 设置 logged_in 为 no
  if (options?.redirect ?? true) {
    const redirectTo = options.redirectTo ?? window.location.href;
    window.location.href = redirectTo;
  }
}