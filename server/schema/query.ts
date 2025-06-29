import { z } from "@hono/zod-openapi";

export const offset_limit_query_schema = z.object({
  offset: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
})
export type OffsetLimitQuery = z.infer<typeof offset_limit_query_schema>

export const offset_limit_query_schema_withQ = z.object({
  q: z.string().min(1),
  offset: z.coerce.number().int().min(0).default(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
})
export type OffsetLimitQuery_withQ = z.infer<typeof offset_limit_query_schema_withQ>