"use client";

import { useCallback, useEffect, useState } from "react";
import { UploadOutFile } from "~/lib/routes/upload/s3";
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const uploadWithRealProgress = useCallback(async (file: File, presigned: UploadOutFile, index: number) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presigned.url, true);
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          console.log(`Upload progress: ${percent.toFixed(2)}%, ${e.loaded} / ${e.total} bytes`);
          setUploadProgress((prevProgress) => {
            const newProgress = [...prevProgress];
            newProgress[index] = percent;
            return newProgress;
          });
        }
      });
      xhr.onload = () => {
        resolve(xhr.response);
      };
      xhr.onerror = () => {
        reject(new Error("Upload failed"));
      };
      xhr.send(file);
    });
  }, []);

  const customUpload = useCallback(async (files: File[], presignedUrls: UploadOutFile[]) => {
    setIsUploading(true);
    setUploadProgress(new Array(files.length).fill(0)); // 初始化上传进度

    console.log("Presigned URLs", presignedUrls);
    console.log("Uploading", files.length, "files:", files);

    for (const [index, file] of files.entries()) {
      const presigned = presignedUrls[index];
      if (!presigned) {
        console.error("No presigned URL found for", file.name);
        continue;
      }

      try {
        const uploadRes = await uploadWithRealProgress(file, presigned, index);
        console.log("Upload response", uploadRes);
      } catch (e) {
        console.error("Failed to upload", file.name, "to", presigned.url, e);
      }
    }

    console.log("Upload Completed.");
    setIsUploading(false);
  }, [uploadWithRealProgress]);

  return {
    isUploading,
    uploadProgress,
    customUpload,
  };
};