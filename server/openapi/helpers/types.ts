import type { z } from "@hono/zod-openapi";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: This is necessary because we need to support multiple Zod schema types
export type ZodSchema = z.ZodUnion | z.AnyZodObject | z.ZodArray<z.AnyZodObject>;