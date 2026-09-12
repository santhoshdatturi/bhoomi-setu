"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload01Icon,
  File01Icon,
  Delete01Icon,
  Loading03Icon,
  RefreshIcon,
  Pdf01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import type { FileBucket } from "@/lib/db/types";

export interface FileUploadProps {
  label?: string;
  description?: string;
  currentFileUrl?: string | null;
  currentFileName?: string | null;
  onFileIdChange: (fileId: string | null) => void;
  bucket?: FileBucket;
  accept?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  aspectRatio?: "square" | "video" | "banner" | "poster" | "auto";
  className?: string;
  dropzoneClassName?: string;
  readOnly?: boolean;
}

export function FileUpload({
  label,
  description,
  currentFileUrl,
  currentFileName,
  onFileIdChange,
  bucket = "documents",
  accept = ".pdf,image/png,image/jpeg,image/webp,image/tiff",
  allowedTypes,
  maxSizeMB = 25,
  aspectRatio = "auto",
  className,
  dropzoneClassName,
  readOnly = false,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentFileUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(currentFileName ?? null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const parsedFileId = currentFileUrl
    ? currentFileUrl.split("/").pop()?.split("?")[0] ?? null
    : null;
  const [internalFileId, setInternalFileId] = useState<string | null>(parsedFileId);
  const [mediaLoading, setMediaLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevFileUrl, setPrevFileUrl] = useState(currentFileUrl);
  if (currentFileUrl !== prevFileUrl) {
    setPrevFileUrl(currentFileUrl);
    setPreview(currentFileUrl ?? null);
    setInternalFileId(
      currentFileUrl
        ? currentFileUrl.split("/").pop()?.split("?")[0] ?? null
        : null
    );
  }

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const isImage = (type?: string | null, url?: string | null) => {
    if (type?.startsWith("image/")) return true;
    if (url && /\.(png|jpe?g|webp|gif|svg|tiff?)($|\?)/i.test(url)) return true;
    return false;
  };

  const isPdf = (type?: string | null, url?: string | null) => {
    if (type === "application/pdf") return true;
    if (url && /\.pdf($|\?)/i.test(url)) return true;
    return false;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      // 1. Validate File Type
      if (allowedTypes && allowedTypes.length > 0) {
        if (!allowedTypes.includes(file.type)) {
          toast.error("Invalid file format. Please upload an accepted file type.");
          return;
        }
      }

      // 2. Validate File Size
      const maxSizeB = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeB) {
        toast.error(`File is too large. Maximum size allowed is ${maxSizeMB}MB.`);
        return;
      }

      setMediaLoading(true);
      setFileName(file.name);
      setMimeType(file.type);

      const localPreviewUrl = URL.createObjectURL(file);
      setPreview(localPreviewUrl);
      setUploading(true);

      try {
        // Step 1: Create file record and retrieve presigned upload URL in a single call
        const createRes = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            sizeBytes: file.size,
            mimeType: file.type || "application/octet-stream",
            bucket,
          }),
        });

        const createJson = await createRes.json();
        if (!createRes.ok || !createJson.success) {
          throw new Error(createJson.error?.userMessage || "Failed to create file record");
        }

        const targetFileId = createJson.data.id;
        const uploadUrl = createJson.data.uploadUrl;
        if (!targetFileId) throw new Error("Failed to resolve target file ID");

        // Step 2: Upload file via presigned URL (with automatic fallback to server upload if CORS blocks)
        let uploadedDirectly = false;
        if (uploadUrl) {
          try {
            const s3Res = await fetch(uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type || "application/octet-stream" },
            });
            if (s3Res.ok) uploadedDirectly = true;
          } catch {
            // Direct S3 failed (e.g. browser CORS), fallback to server upload below
          }
        }

        if (!uploadedDirectly) {
          const formData = new FormData();
          formData.append("file", file);
          const serverUploadRes = await fetch("/api/files/upload", {
            method: "POST",
            body: formData,
          });
          const serverUploadJson = await serverUploadRes.json();
          if (!serverUploadRes.ok || !serverUploadJson.success) {
            throw new Error(serverUploadJson.error?.userMessage || "Upload failed");
          }
        }

        setInternalFileId(targetFileId);
        onFileIdChange(targetFileId);
        toast.success("File uploaded successfully");
      } catch (err) {
        console.error("Upload failed:", err);
        toast.error(err instanceof Error ? err.message : "Failed to upload file");
        setPreview(currentFileUrl ?? null);
        setFileName(currentFileName ?? null);
      } finally {
        setMediaLoading(false);
        setUploading(false);
      }
    },
    [onFileIdChange, bucket, currentFileUrl, currentFileName, allowedTypes, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleRemove = useCallback(async () => {
    if (internalFileId) {
      try {
        const res = await fetch(`/api/files/${internalFileId}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (!res.ok && json.error) {
          toast.error(json.error.userMessage || "Failed to delete file");
          return;
        }
      } catch (err) {
        console.error("Failed to delete file record:", err);
        toast.error("An error occurred while deleting the file.");
        return;
      }
      setInternalFileId(null);
    }

    setPreview(null);
    setFileName(null);
    setMimeType(null);
    onFileIdChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileIdChange, internalFileId]);

  const aspectRatioClass =
    aspectRatio === "banner"
      ? "aspect-[16/9] md:aspect-[4/1] w-full"
      : aspectRatio === "square"
        ? "aspect-square w-full max-w-sm"
        : aspectRatio === "video"
          ? "aspect-video w-full"
          : aspectRatio === "poster"
            ? "aspect-[4/5] w-full max-w-xs"
            : "min-h-[140px] w-full";

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {label && (
        <div>
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      )}

      <div
        onDragOver={(e) => {
          if (readOnly) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => !readOnly && setDragOver(false)}
        onDrop={(e) => !readOnly && handleDrop(e)}
        onClick={() => !readOnly && !uploading && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-150 overflow-hidden transform-gpu bg-muted/10 p-4",
          !readOnly && "cursor-pointer",
          readOnly && "opacity-80 border-transparent",
          !dropzoneClassName && aspectRatioClass,
          !readOnly && dragOver
            ? "border-primary bg-primary/5"
            : !readOnly
              ? "border-border/80 hover:border-primary/50 hover:bg-muted/20"
              : "",
          uploading && "pointer-events-none",
          dropzoneClassName
        )}
      >
        {preview ? (
          <>
            {isImage(mimeType, preview) ? (
              // Image preview
              <div className="relative size-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={fileName || label || "Uploaded file"}
                  onLoad={() => setMediaLoading(false)}
                  onError={() => {
                    setMediaLoading(false);
                    setPreview(null);
                  }}
                  className={cn(
                    "max-h-56 max-w-full rounded object-contain transition-all duration-300",
                    uploading && "opacity-40 blur-xs scale-102",
                    mediaLoading && "opacity-0"
                  )}
                />
              </div>
            ) : (
              // Document / PDF preview card
              <div className="flex flex-col items-center justify-center gap-2 p-3 text-center">
                <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <HugeiconsIcon
                    icon={isPdf(mimeType, preview) ? Pdf01Icon : File01Icon}
                    className="size-6"
                  />
                </div>
                <div className="max-w-xs truncate font-mono text-xs font-semibold text-foreground">
                  {fileName || "Document File"}
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                  <span>Ready for linking</span>
                </div>
              </div>
            )}

            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-xs">
                <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin text-primary" />
                <span className="text-xs font-mono font-medium text-foreground">Uploading...</span>
              </div>
            ) : !readOnly ? (
              <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center gap-2 bg-background/85 opacity-0 transition-opacity hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (inputRef.current) inputRef.current.click();
                  }}
                  className="gap-1.5 text-xs font-mono h-8"
                >
                  <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
                  <span>Replace File</span>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="gap-1.5 text-xs font-mono h-8"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
                  <span>Remove</span>
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-muted-foreground">
            <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
              <HugeiconsIcon icon={Upload01Icon} className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">
                Drop file here or click to browse
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PDF, RoR scans, PNG, JPG up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile action buttons below preview */}
      {preview && !readOnly && !uploading && (
        <div className="flex md:hidden items-center gap-2 mt-1 w-full">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1 text-xs font-mono h-8 gap-1.5"
            onClick={() => {
              if (inputRef.current) inputRef.current.click();
            }}
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
            <span>Replace</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="flex-1 text-xs font-mono h-8 gap-1.5"
            onClick={handleRemove}
          >
            <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
            <span>Remove</span>
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
