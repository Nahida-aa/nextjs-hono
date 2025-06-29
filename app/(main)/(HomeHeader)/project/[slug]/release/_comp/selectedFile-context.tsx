"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface SelectedFileContextType {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const SelectedFileContext = createContext<SelectedFileContextType | undefined>(undefined);

export const SelectedFileProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <SelectedFileContext.Provider value={{ selectedFile, setSelectedFile }}>
      {children}
    </SelectedFileContext.Provider>
  );
};

export const useSelectedFile = () => {
  const context = useContext(SelectedFileContext);
  if (!context) {
    throw new Error("useSelectedFile must be used within a SelectedFileProvider");
  }
  return context;
};