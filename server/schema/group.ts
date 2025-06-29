import { z } from "@hono/zod-openapi";

export const group_meta_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable(),
  image: z.string().nullable(),
  nickname: z.string().nullable(),
})