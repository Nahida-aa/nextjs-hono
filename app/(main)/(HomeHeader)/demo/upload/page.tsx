"use client";

import { useState } from "react";
import { SubmitButton } from "~/components/common/submit-button";
import { Button } from "~/components/ui/button";
import { UploadOutFile } from "~/lib/routes/upload/post";
import {
  UploadButton,
  UploadDropzone,
  useHonoUpload,
  useUploadThing,
} from "~/lib/utils/uploadthing";

export default function Home() {
  // const { startUpload } = useUploadThing("videoAndImage", {
  const { startUpload } = useHonoUpload("videoAndImage", {
    /**
     * @see https://docs.uploadthing.com/api-reference/react#useuploadthing
     */
    onBeforeUploadBegin: (files) => {
      console.log("Uploading", files.length, "files:", files);
      return files;
    },
    onUploadBegin: (name) => {
      console.log("Beginning upload of", name);
      setIsUploading(true);
    },
    onClientUploadComplete: (res) => { // 加上回调才会触发, 才怪
      // 在服务器端 onUploadComplete 回调之后运行
      console.log("Upload Completed.", res.length, "files uploaded: ", res);
      setIsUploading(false);
    },
    onUploadProgress(p) {
      console.log("onUploadProgress", p);
    },
    onUploadError(e) { // 加上回调才会触发
      console.error("onUploadError", e);
      setIsUploading(false);
    },
  });
  const [isUploading, setIsUploading] = useState(false);
  const [meFiles, setMeFiles] = useState<File[]>([]);
  const customUpload = async (files: File[]) => {
    setIsUploading(true);
    const getPresignedIn = {
      files: files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      }))
    }
  
    const getPresignedRes = await fetch("/api/hono/upload?actionType=upload&slug=videoAndImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getPresignedIn),
    });
    console.log("Get presigned response", getPresignedRes);
    const presignedOut = await getPresignedRes.json() as UploadOutFile[]
    console.log("Presigned URLs", presignedOut);
    console.log("Uploading", files.length, "files:", files);

    for (const [index, file] of files.entries()) {
      const presigned = presignedOut[index];
      if (!presigned) {
        console.error("No presigned URL found for", file.name);
        continue;
      }
      const formData = new FormData();
      formData.append("file", file);
      const HEADRes = await fetch(presigned.url, { method: "HEAD" })
      console.log("HEAD response", HEADRes);
      console.log("customUpload: startUpload: PUT", file.name, "to", presigned.url);
      const res = await fetch(presigned.url, {
        method: "PUT",
        body: formData,
      });
      console.log("Upload response", res);
      const resJson = await res.json();
      console.log("Upload response json", resJson);
      if (!res.ok) {
        console.error("Failed to upload", file.name, "to", presigned.url);
      } 
    }

    console.log("Upload Completed.");
    setIsUploading(false);
  };

  return (
    <main>
      <UploadButton
        /**
         * @see https://docs.uploadthing.com/api-reference/react#uploadbutton
         */
        endpoint={(routeRegistry) => routeRegistry.videoAndImage}
        onClientUploadComplete={(res) => {
          console.log(`onClientUploadComplete`, res);
          alert("Upload Completed");
        }}
        onUploadBegin={() => {
          console.log("upload begin");
        }}
        config={{ appendOnPaste: true, mode: "manual" }}
      />
      <UploadDropzone
        /**
         * @see https://docs.uploadthing.com/api-reference/react#uploaddropzone
         */
        endpoint={(routeRegistry) => routeRegistry.videoAndImage}
        onUploadAborted={() => {
          alert("Upload Aborted");
        }}
        onClientUploadComplete={(res) => {
          console.log(`onClientUploadComplete: res`, res);
          alert("Upload Completed");
        }}
        onUploadBegin={() => {
          console.log("upload begin");
        }}
      />
      <div>
        <input
          type="file"
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            setMeFiles(files);
          }}
        />
        <SubmitButton isLoading={isUploading} onClick={async () => {
          await startUpload(meFiles);
        }
        }>useUpload</SubmitButton>
      </div>
      <div>
        me:
        <input
          type="file"
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            setMeFiles(files);
          }}
        />
        <SubmitButton isLoading={isUploading} onClick={async () => {
          await customUpload(meFiles);
        }
        }>meUpload</SubmitButton>
      </div>
    </main>
  );
}