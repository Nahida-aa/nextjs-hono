import { z } from "@hono/zod-openapi";

// Regular expression to validate slug format: alphanumeric, underscores, dashes, and Unicode characters
const slugUnicodeReg = /^[\w\p{L}\p{N}-]+$/u;
const SLUG_UNICODE_ERROR_MESSAGE = "Slug can only contain letters, numbers, dashes, underscores, and Unicode characters; Slug 只能包含字母、数字、-、_和 Unicode 字符";

const SlugUnicodeParamsSchema = z.object({
  slug: z.string()
    .regex(slugUnicodeReg, SLUG_UNICODE_ERROR_MESSAGE)
    .openapi({
      param: {
        name: "slug",
        in: "path",
        required: true,
      },
      required: ["slug"],
      example: "我的-酷文章",
    }),
});

export default SlugUnicodeParamsSchema;