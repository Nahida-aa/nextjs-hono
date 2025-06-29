"use client";

import { useCallback, useEffect, useState } from "react";
import { SubmitButton } from "~/components/common/submit-button";
import { UploadOutFile } from "~/lib/routes/upload/post";
import { analyzeMCFile } from "~/app/(main)/(HomeHeader)/project/[slug]/release/create/lib/infer";
import { useFileUpload } from "./hook";

export default function NxtPage() {
  const [meFiles, setMeFiles] = useState<File[]>([]);
  const [inputCount, setInputCount] = useState(0);
  // const [isUploading, setIsUploading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const { isUploading, uploadProgress, customUpload } = useFileUpload();

  useEffect(() => {
    console.log("meFiles", meFiles);
  }, [meFiles]);

  const getPresignedUrls = async (files: File[]): Promise<UploadOutFile[]> => {
    const getPresignedIn = {
      files: files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      })),
    };
    const getPresignedRes = await fetch("/api/hono/upload/s3?actionType=upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getPresignedIn),
    });
    console.log("Get presigned response", getPresignedRes);
    return await getPresignedRes.json() as UploadOutFile[];
  };

  // const customUpload = async (files: File[]) => {
  //   setIsUploading(true);
  //   setUploadProgress(new Array(files.length).fill(0)); // 初始化上传进度

  //   const getPresignedIn = {
  //     files: files.map((file) => ({
  //       name: file.name,
  //       type: file.type,  
  //       size: file.size,
  //       lastModified: file.lastModified,
  //     }))
  //   }
  //   const getPresignedRes = await fetch("/api/hono/upload/s3?actionType=upload&slug=test", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(getPresignedIn),
  //   });
  //   console.log("Get presigned response", getPresignedRes);
  //   const presignedOut = await getPresignedRes.json() as UploadOutFile[]
  //   console.log("Presigned URLs", presignedOut);
  //   console.log("Uploading", files.length, "files:", files);

  //   for (const [index, file] of files.entries()) {
  //     const presigned = presignedOut[index];
  //     if (!presigned) {
  //       console.error("No presigned URL found for", file.name);
  //       continue;
  //     }

  //     const uploadWithRealProgress = async (file: File, presigned: UploadOutFile) => {
  //       // const response = new Response(stream);
  //       // const blob = await response.blob();
        
  //       const xhr = new XMLHttpRequest();
  //       xhr.open("PUT", presigned.url, true);
  //       return new Promise(async (resolve, reject) => {
  //         xhr.upload.addEventListener("progress", (e) => {
  //           if (e.lengthComputable) {
  //             const percent = (e.loaded / e.total) * 100;
  //             console.log(`Upload progress: ${percent.toFixed(2)}%, ${e.loaded} / ${e.total} bytes`);
  //             setUploadProgress((prevProgress) => {
  //               const newProgress = [...prevProgress];
  //               newProgress[index] = percent;
  //               return newProgress;
  //             });
  //           }
  //         });
  //         xhr.onload = () => {
  //           resolve(xhr.response);
  //         }
  //         xhr.onerror = () => {
  //           reject(new Error("Upload failed"));
  //         }

  //         xhr.send(file);
  //       })
  //     }

  //     try {
  //       const uploadRes = await uploadWithRealProgress(file, presigned);
  //       console.log("Upload response", uploadRes);
  //     } catch (e) {
  //       console.error("Failed to upload", file.name, "to", presigned.url, e);
  //     }
  //   }

  //   console.log("Upload Completed.");
  //   setIsUploading(false);
  // };

  const handleUpload = async () => {
    const presignedUrls = await getPresignedUrls(meFiles);
    await customUpload(meFiles, presignedUrls);
  };

  return (
    <main>
      <form action="" className="flex-col flex">
        me:
        <input
          type="file"
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            setInputCount(inputCount + 1);
            console.log("inputCount:", inputCount);
            // 追加:
            setMeFiles((prevFiles) => [...prevFiles, ...files]);
            // 分析文件内容
            for (const file of files) {
              const analysis = await analyzeMCFile(file);
              console.log("File analysis:", analysis);
            }
          }}
        />
        <SubmitButton isLoading={isUploading} onClick={handleUpload}>s3Upload</SubmitButton>

        <ul>
          {meFiles.map((file, index) => (
            <li key={file.name}>
              <span className="space-x-2">
                <span>{file.name}</span><span>{file.type}</span><span>{file.webkitRelativePath}</span>
              </span>
              {uploadProgress[index] && isUploading && <>
                <progress value={uploadProgress[index]} max="100"></progress>
                {uploadProgress[index].toFixed(2)}%
              </>}
              <button className="bg-primary"
                onClick={() => {
                  setMeFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
                  // setUploadProgress((prevProgress) => prevProgress.filter((_, i) => i !== index));
                }}
              >删除</button>
            </li>
          ))}
        </ul>
      </form>
      <progress value={50} max="100"></progress>{50}%
    </main>
  );
}