"use client";

import { Info, Upload as UploadIcon  } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelectedFile } from "./selectedFile-context";

interface UploadReleaseProps {
  slug: string; 
}

export const UploadRelease = ({
  slug
}:UploadReleaseProps) => {
  const router = useRouter();
  const { selectedFile, setSelectedFile } = useSelectedFile();

  const onSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`onSelected`, e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      router.push(`/project/${slug}/release/create`); // 只能控制滚动
    }
  }
  return (
    <div className="flex items-center gap-4 p-6 bg-card rounded-lg mb-3">
      <label className="flex w-fit bg-primary px-4 py-2 gap-2 rounded-md cursor-pointer leading-5">
        <UploadIcon size={20} />Upload a version
        <input type="file" accept=".jar,.zip,.litemod,application/java-archive,application/x-java-archive,application/zip" className="hidden " onChange={onSelected} />
      </label>
      <span className="flex gap-2 items-center"><Info size={16} />Click to choose a file or drag one onto this page 
      </span>
      <div className="fixed flex h-screen top-0 w-screen left-0 z-10 pointer-events-none"></div>
    </div>
  );
}