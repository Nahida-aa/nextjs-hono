'use server';
import { headers as nextHeaders } from "next/headers"
import { cookies } from 'next/headers'
import { z } from 'zod';

// import { createUser, getUser } from '~/server/db/queries';

import { createActionURL } from './auth';
import { sign_in_schema } from './_comp/signIn-modal';
import { signUp_schema } from "./_comp/signUp-modal";
import { SessionTokenWithName } from "~/lib/routes/auth/login";
import { verifyJWT } from "~/lib/core/token";
import { SessionTokenPayload } from "~/lib/middleware/auth";

const authFormSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(6),
});


export const server_sign_in = async (values: z.infer<typeof sign_in_schema>) => {
  try {
    console.log(`app/(auth)/actions.ts::sign_in 开始登录: `)
    console.log(JSON.stringify(values))
    const headers = new Headers(await nextHeaders())
    // const signInURL = createActionURL(
    //     "signin",
    //     // @ts-expect-error `x-forwarded-proto` is not nullable, next.js sets it by default
    //     headers.get("x-forwarded-proto"),
    //     headers,
    //     // process.env,
    //     {basePath: "api/py/auth"}
    //   )
    const signInURL = "https://api.nahida-aa.us.kg/api/py/auth/signin"
    // headers.set("Content-Type", "application/x-www-form-urlencoded")
    const snHeaders = { "Content-Type": "application/x-www-form-urlencoded" }
    const body = new URLSearchParams(values)
    // headers.set("Content-Type", "application/json")
    // const body = JSON.stringify(values)
    const resp = await fetch(signInURL,
      {
        method: "POST",
        headers: snHeaders,
        // headers: {
        //   "Content-Type": "application/json",
        // },
        body: body,
      }
    );
    if (resp.ok) {
      const data = await resp.json();
      console.log(`app/(auth)/actions.ts::sign_in 登录成功: ${data}`);

      // 设置 cookies
      const cookieStore = await cookies();
      cookieStore.set('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
      });
      cookieStore.set('refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return { 
        access_token: data.access_token, 
        token_type: data.token_type,
        user: data.user }
      // 处理登录成功逻辑
    } else {
      const errorText = await resp.text();
      console.error(`app/(auth)/actions.ts::sign_in 登录失败,请求有响应: ${errorText}`);
      throw new Error(`登录失败,请求有响应: ${errorText}`);
    }
    // await signIn('py', {
    //   email: values.name,
    //   password: values.password,
    //   redirectTo: "/",
    //   // redirect: false,
    // },{
    // },{
    //   // basePath: "api/py/auth",
    //   basePath: "api/py",
    // });
  } catch (error) {
    console.error(`app/(auth)/actions.ts::sign_in 登录失败,问题不明: ${error}`)
    throw new Error(`登录失败,问题不明: ${error}`);
  }
}

const cookieOptional = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export const hono_sign_in = async (values: z.infer<typeof sign_in_schema>) => {
  try {
    console.log(JSON.stringify(values))
    // const signInURL = "/api/hono/auth/login"
    const headers = new Headers(await nextHeaders())
    const signInURL = await createActionURL(
      "login",
      // @ts-expect-error `x-forwarded-proto` is not nullable, next.js sets it by default
      headers.get("x-forwarded-proto"),
      headers,
      // process.env,
      {basePath: "api/hono/auth"}
    )
    // headers.set("Content-Type", "application/x-www-form-urlencoded")
    // const snHeaders = { "Content-Type": "application/x-www-form-urlencoded" }
    // const body = new URLSearchParams(values)
    const lgHeaders = { "Content-Type": "application/json" }
    const body = JSON.stringify({
      name: values.nameOrEmail,
      password: values.password,
    })

    const resp = await fetch(signInURL,
      {
        method: "POST",
        headers: lgHeaders,
        body: body,
      }
    );
    if (resp.ok) {
      const data: SessionTokenWithName = await resp.json();
      console.log(`app/(auth)/actions.ts::sign_in 登录成功: ${data}`);
      
      // 设置 cookies
      const cookieStore = await cookies();
      cookieStore.set('session_token', data.session_token, cookieOptional);
      cookieStore.set('name', data.name, cookieOptional);
      return data
    } else {
      const errorText = await resp.text();
      console.error(`app/(auth)/actions.ts::sign_in 登录失败,请求有响应: ${errorText}`);
      throw new Error(`登录失败,请求有响应: ${errorText}`);
    }
  } catch (error) {
    console.error(`app/(auth)/actions.ts::sign_in 登录失败,问题不明: ${error}`)
    throw new Error(`登录失败,问题不明: ${error}`);
  }
}

export const hono_signUp = async (values: z.infer<typeof signUp_schema>) => {
  try {
    console.log(JSON.stringify(values))
    // const signInURL = "/api/hono/auth/login"
    const headers = new Headers(await nextHeaders())
    const signInURL = await createActionURL(
      "sign-up",
      // @ts-expect-error `x-forwarded-proto` is not nullable, next.js sets it by default
      headers.get("x-forwarded-proto"),
      headers,
      // process.env,
      {basePath: "api/hono/auth"}
    )
    // headers.set("Content-Type", "application/x-www-form-urlencoded")
    // const snHeaders = { "Content-Type": "application/x-www-form-urlencoded" }
    // const body = new URLSearchParams(values)
    const lgHeaders = { "Content-Type": "application/json" }
    const body = JSON.stringify({
      name: values.name,
      password: values.password,
    })

    const resp = await fetch(signInURL,
      {
        method: "POST",
        headers: lgHeaders,
        body: body,
      }
    );
    if (resp.ok) {
      const data: SessionTokenWithName = await resp.json();
      console.log(`app/(auth)/actions.ts::sign_in 登录成功: ${data}`);
      
      // 设置 cookies
      const cookieStore = await cookies();
      cookieStore.set('session_token', data.session_token, cookieOptional);
      cookieStore.set('name', data.name, cookieOptional);
      return data
    } else {
      const errorText = await resp.text();
      console.error(`app/(auth)/actions.ts::sign_in 登录失败,请求有响应: ${errorText}`);
      throw new Error(`登录失败,请求有响应: ${errorText}`);
    }
  } catch (error) {
    console.error(`app/(auth)/actions.ts::sign_in 登录失败,问题不明: ${error}`)
    throw new Error(`登录失败,问题不明: ${error}`);
  }
}

