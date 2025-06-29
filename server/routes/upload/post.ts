import { createRouter } from "~/lib/create-app";
import { createRoute, z } from "@hono/zod-openapi";
import jsonContent from "~/lib/openapi/helpers/json-content";
import httpStatus from "~/lib/http-status-codes"
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import { get_current_user_and_res } from "~/lib/middleware/auth";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { generateSignatureURLAndKey, OSS_upload_url } from "./util";
import { createUploadthing, type FileRouter } from "uploadthing/server";
import { inferBaseUrl } from "~/server/utils/url";

const router = createRouter()

const upload_query_schema = z.object({
  slug: z.string().optional(), // The slug of the file route
  actionType: z.string().optional().openapi({
    example: "upload"
  }), //  
})

const upload_in_schema =z.object({
  files: z.array(z.object({
    name: z.string(), // The name of the file, represented as a string.
    type: z.string(), // The MIME type of the file, represented as a string.
    size: z.number(), // The size of the file in bytes, represented as a number.
    lastModified: z.number().optional(), // The last modification timestamp of the file, represented as a number. This property is optional.
  })),
  input: z.unknown(), // The input data for the action, represented as an object.
}).or(z.unknown())
export type UploadInFile = {
  name: string,
  type: string,
  size: number,
  lastModified?: number,
}
const upload_out_schema = z.array(z.object({
  url: z.string(), // presigned url
  key: z.string(), // object(file) key
  customId: z.string().nullable(),
  name: z.string(), // file name
})).or(z.any())
export type UploadOutFile = {
  url: string,
  key: string,
  customId: string|null,
  name: string,
};
router.openapi(createRoute({
  tags: ["upload"], method: "post", path: "/upload", description: "auth upload return presigned.url",
  request: {
    query: upload_query_schema,
    body: jsonContent(upload_in_schema, "Depends on action"),
  },
  responses: {
    [httpStatus.OK]: jsonContent(upload_out_schema, "取决于操作"),
    [httpStatus.UNAUTHORIZED]: jsonContent(createMessageObjectSchema('Unauthorized'),'Unauthorized: 未登录'),
    [httpStatus.FORBIDDEN]: jsonContent(createMessageObjectSchema('Forbidden'),'Forbidden: 禁止的'),
    [httpStatus.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(upload_in_schema),'The validation error(s); 结构验证错误'),
  },
}), async (c) => {
  // const auth_user = CU_ret.user
  const { slug, actionType } = c.req.valid("query")
  console.log(`/api/hono/upload: slug: ${slug} actionType: ${actionType}`)
  const upload_in = c.req.valid("json")
  console.log(`/api/hono/upload ${slug} ${actionType} upload_in: ${JSON.stringify(upload_in)}`)

  switch (actionType) {
    case 'upload':
      const files = (upload_in as {files: UploadInFile[], input: unknown}).files
      if (!slug) return c.json({ message: 'Forbidden: slug is required' }, httpStatus.FORBIDDEN);

      const CU_ret = await get_current_user_and_res(c)
      if (!CU_ret.success) return c.json(CU_ret.json_body, CU_ret.status)
      try {
        const out = await generateUploadOut(files, slug)
        return c.json(out, httpStatus.OK)
      } catch (error: any) {
        return c.json({ message: error.message }, httpStatus.INTERNAL_SERVER_ERROR);
      }
    default:
      return c.json((upload_in as any), httpStatus.OK);
  }
})

const generateUploadOut = async (files: UploadInFile[], slug: string): Promise<UploadOutFile[]> => {
  const uploadOutFiles = await Promise.all(files.map(async (file) => {
    const { url, key } = await generateSignatureURLAndKey(file, slug);
    return { url, key, name: file.name, customId: null };
  }));

  const fileKeys = uploadOutFiles.map((file) => file.key);
  await postToOSS({fileKeys, slug});

  return uploadOutFiles
}

const postToOSS = async ({fileKeys, slug}:{
  fileKeys: string[], slug: string
}) => {
  const baseUrl = await inferBaseUrl();

  const headers = {
    'Content-Type': 'application/json',
    "x-uploadthing-api-key": process.env.UPLOADTHING_SECRET!,
  }
  const data = {
    fileKeys,
    metadata: { testMetadata: "aa"},
    callbackUrl: `${baseUrl}/api/hono/upload`, 
    callbackSlug: slug,
    awaitServerData: false, // If set to true, the upload request will not respond immediately after file upload, but instead wait for your server to call the /callback-result endpoint with the result of running the onUploadComplete callback. Enable this only if your client needs to get data from the server callback as it will increase the duration of the upload.
    isDev: process.env.NODE_ENV === 'development',
  }
  const url = `${OSS_upload_url}route-metadata`
  const res = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });
  console.log(`postToOSS: `, res)
  const resJson = await res.json();
  console.log(`postToOSS: resJson`, resJson)
};

export default router
