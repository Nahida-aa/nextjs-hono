import { z } from "@hono/zod-openapi";

const NameParamsSchema = z.object({
  name: z.string().min(1).max(32).openapi({
    param: {
      name: "name",
      in: "path",
      required: true,
    },
    required: ["name"],
    example: "我的 空格名字",
  }),
});

export const UsernameParamsSchema = z.object({
  username: z.string().min(1).max(32).openapi({
    param: {
      name: "username",
      in: "path",
      required: true,
    },
    required: ["username"],
    example: "测试用户",
  }),
});

export default NameParamsSchema;