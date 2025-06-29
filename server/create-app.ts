import { OpenAPIHono } from "@hono/zod-openapi";
import defaultHook from "./openapi/default-hook";

export  function createRouter() {
  return new OpenAPIHono({
    defaultHook, 
  }) // 例如请求格式错误时不用这个钩子会是 400， 正常应该是 422
}
export default function createApp() {
  const app = createRouter().basePath('/api/hono') // hono 采用的 每个路由都是一个独立的实例， 不过之后会注册到一个实例上
  return app
}