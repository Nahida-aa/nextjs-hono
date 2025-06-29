import { createRouter } from "~/lib/create-app";
import { createRoute, z } from "@hono/zod-openapi";
import jsonContent from "~/lib/openapi/helpers/json-content";
import httpStatus from "~/lib/http-status-codes"
import createErrorSchema from "~/lib/openapi/schemas/create-error-schema";
import { get_current_user_and_res } from "~/lib/middleware/auth";
import createMessageObjectSchema from "~/lib/openapi/schemas/create-message-object";
import { ACCESS_KEY_ID, ACCOUNT_ID, generateSignatureURLAndKey, OSS_upload_url,SECRET_ACCESS_KEY } from "./util";
import { ListBucketsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = "auto"; // rainyun
if (!ACCOUNT_ID) throw new Error("CF_Account_ID is required")
if (!ACCESS_KEY_ID) throw new Error("CF_Access_Key_ID is required")
if (!SECRET_ACCESS_KEY) throw new Error("CF_Secret_Access_Key is required")
export const S3 = new S3Client({
    region,
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
})

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
    pathname: z.string().optional(), // The pathname of the file, represented as a string. This property
    type: z.string(), // The MIME type of the file, represented as a string.
    size: z.number(), // The size of the file in bytes, represented as a number.
    lastModified: z.number().optional(), // The last modification timestamp of the file, represented as a number. This property is optional.
  })),
  input: z.unknown(), // The input data for the action, represented as an object.
}).or(z.unknown())
export type UploadInFile = {
  name: string,
  pathname?: string,
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
  tags: ["upload"], method: "post", path: "/upload/s3", description: "auth upload return presigned.url",
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
  console.log(`/api/hono/upload/s3: slug: ${slug} actionType: ${actionType}`)
  const upload_in = c.req.valid("json")
  console.log(`/api/hono/upload/s3 ${slug} ${actionType} upload_in: ${JSON.stringify(upload_in)}`)

  // console.log(`ACCOUNT_ID: ${ACCOUNT_ID} ACCESS_KEY_ID: ${ACCESS_KEY_ID} SECRET_ACCESS_KEY: ${SECRET_ACCESS_KEY}`)
  // console.log(await S3.send(new ListBucketsCommand({})));

  switch (actionType) {
    case 'upload':
      const files = (upload_in as {files: UploadInFile[], input: unknown}).files
      // if (!slug) return c.json({ message: 'Forbidden: slug is required' }, httpStatus.FORBIDDEN);

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

const generateUploadOut = async (files: UploadInFile[], slug?: string): Promise<UploadOutFile[]> => {
  const uploadOutFiles = await Promise.all(files.map(async (file) => {
    // You can also create links for operations such as putObject to allow temporary write access to a specific key.
    const key = file.pathname || `${file.name}`
    const presignedUrl = await getSignedUrl(S3, new PutObjectCommand({ Bucket: "mcc", Key: key }),{ expiresIn: 3600 },)
    // curl -X PUT https://my-bucket-name.<accountid>.r2.cloudflarestorage.com/dog.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential<credential>&X-Amz-Date=<timestamp>&X-Amz-Expires=3600&X-Amz-Signature=<signature>&X-Amz-SignedHeaders=host&x-id=PutObject -F "data=@dog.png"

    // const { url, key } = await generateSignatureURLAndKey(file, slug);
    return { url: presignedUrl, key, name: file.name, customId: null };
  }));

  return uploadOutFiles
}

export default router