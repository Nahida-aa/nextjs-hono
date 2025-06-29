import SQIds, { defaultOptions } from "sqids";
import { djb2, shuffle } from "~/lib/utils/encode";
import { UploadInFile, UploadOutFile } from "./post";
import crypto from "crypto";

const config = {
  REGION_ALIAS: "sea1",
  appId: process.env.UPLOADTHING_APP_ID,
  apiKey: process.env.UPLOADTHING_SECRET,
}

export const OSS_upload_url = `https://${config.REGION_ALIAS}.ingest.uploadthing.com/`;

export const generateFileKey = async (appId: string, fileSeed: string) => {
  // Hash and Encode the parts and apiKey as sqids
  const alphabet = shuffle(defaultOptions.alphabet, appId);

  const encodedAppId = new SQIds({ alphabet, minLength: 12 }).encode([
    Math.abs(djb2(appId)),
  ]);

  const fileUrl = `${encodedAppId}/test/${fileSeed}`;
  // We use a base64 encoding here to ensure the file seed is url safe, but
  // you can do this however you want
  // const encodedFileSeed = encodeBase64(fileSeed);
  return fileUrl.replace(/\//g, "%2F");
  // return `${encodedAppId}/test/${fileSeed}`;
}

const generateSearchParams = async (appId: string, uploadInFile: UploadInFile, slug: string) => {
  const {name, size, type} = uploadInFile;
  return new URLSearchParams({
    // Required
    expires: `${Date.now() + 60 * 60 * 1000}`, // 1 hour from now (you choose)
    "x-ut-identifier": appId,
    "x-ut-file-name": name,
    "x-ut-file-size": `${size}`,
    "x-ut-slug": slug,
    // Optional
    "x-ut-file-type": type,
    // "x-ut-custom-id": "MY_CUSTOM_ID",
    "x-ut-content-disposition": "inline",
    "x-ut-acl": "public-read",
  });
}
export const generateSignatureURLAndKey = async (uploadInFile: UploadInFile, slug: string) => {
  const { REGION_ALIAS, appId, apiKey } = config;
  if (!appId)  throw new Error("upload App ID is required for generating file key.");

  const fileKey = await generateFileKey(appId, uploadInFile.name);
  const searchParams = await generateSearchParams(appId, uploadInFile, slug);

  const url = new URL(
    `${OSS_upload_url}${fileKey}`,
  );
  url.search = searchParams.toString();
  const signature = `hmac-sha256=${hmacSha256(url, apiKey)}`;
  url.searchParams.append("signature", signature);
  return { url: url.toString(), key: fileKey };
}

function hmacSha256(url: URL, apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error("API key is required for generating HMAC signature.");
  }
  return crypto
    .createHmac("sha256", apiKey)
    .update(url.toString())
    .digest("hex");
}
function encodeBase64(fileSeed: string) {
  return Buffer.from(fileSeed).toString("base64");
}


// s3 or oss
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const ACCOUNT_ID = process.env.CF_Account_ID
export const ACCESS_KEY_ID = process.env.CF_Access_Key_ID
export const SECRET_ACCESS_KEY = process.env.CF_Secret_Access_Key
// console.log(`ACCOUNT_ID: ${ACCOUNT_ID} ACCESS_KEY_ID: ${ACCESS_KEY_ID} SECRET_ACCESS_KEY: ${SECRET_ACCESS_KEY}`)

