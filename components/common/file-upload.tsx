"use client";
import { UploadDropzone } from "~/lib/utils/uploadthing";
import NextImage from 'next/image';
import { useState } from "react";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "imageUploader"
}
export const FileUpload = ({
  onChange,
  value,
  endpoint,
}: FileUploadProps) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  

  const handleFileChange = (files: File[]) => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    // onChange(urls);
  };

  return (<>
      <div className="bg-slate-800 ">
      {previewUrls.map((url, index) => (
          <NextImage key={index} src={url} alt={`Uploaded file ${index + 1}`} width={48} height={48} />
        ))}
      </div>
    <UploadDropzone
      className="bg-slate-800 "
      endpoint={endpoint}
      onChange={(files)=>{
        console.log("onChange: Files: ", files);
        onChange(files?.[0].name);
        handleFileChange(files);
      }}
      onBeforeUploadBegin={(files) => { // 的上传时,预处理
        console.log("Files: ", files);
        // get type
        const file = files[0];
        if (!file) {
          return files;
        } else {
          const type = file.type;
          if (type.startsWith("image/")) {
            return files;
          } else {
            throw new Error("Invalid file type");
          }
        } 
        return files;
      }}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
        console.log("onClientUploadComplete: Files: ", res);
      }}
      onUploadError={(error: Error) => {
        console.error(error);
      }}
    />
  </>
  )
}