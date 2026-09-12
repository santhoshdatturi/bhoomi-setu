"use client";

import { FileUpload, type FileUploadProps } from "./file-upload";

export interface ImageUploadProps extends Omit<FileUploadProps, "accept" | "allowedTypes"> {
  currentImageUrl?: string | null;
  aspectRatio?: "square" | "video" | "banner" | "poster" | "auto";
}

export function ImageUpload({
  currentImageUrl,
  aspectRatio = "square",
  maxSizeMB = 5,
  ...props
}: ImageUploadProps) {
  return (
    <FileUpload
      {...props}
      currentFileUrl={currentImageUrl}
      accept="image/png,image/jpeg,image/webp"
      allowedTypes={["image/png", "image/jpeg", "image/webp"]}
      aspectRatio={aspectRatio}
      maxSizeMB={maxSizeMB}
    />
  );
}
