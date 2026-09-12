"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload01Icon,
  File01Icon,
  CheckmarkCircle02Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { INDIAN_STATES } from "@/lib/constants/states";

const DOCUMENT_TYPES = [
  { value: "ror", label: "RoR / RTC / Pahani", desc: "Record of Rights & Tenancy" },
  { value: "7_12", label: "7/12 Extract", desc: "Saat Baara / Saat-Baara Utra" },
  { value: "mutation", label: "Mutation Register", desc: "Pouthe Khata / Ferfar" },
  { value: "sale_deed", label: "Sale Deed", desc: "Registered Title Deed" },
  { value: "patta", label: "Patta / Chitta", desc: "Land ownership certificate" },
  { value: "other", label: "Other Record", desc: "Cadastral / revenue map / other" },
];

interface DocumentUploadModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DocumentUploadModal({ onSuccess, trigger }: DocumentUploadModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<string>("ror");
  const [stateName, setStateName] = useState("Karnataka");
  const [autoProcess, setAutoProcess] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      // Clean filename for initial title
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a document file to upload");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    setIsUploading(true);
    setUploadProgress("Uploading document file...");

    try {
      // 1. Upload file to server endpoint (avoids browser S3 CORS issues)
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.success) {
        throw new Error(uploadJson.error?.userMessage || "Failed to upload file to storage");
      }

      const { fileId } = uploadJson.data;

      // 2. Register document in database
      setUploadProgress("Registering document record...");
      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          title: title.trim(),
          fileName: file.name,
          documentType,
          state: stateName.trim() || null,
        }),
      });

      const docJson = await docRes.json();
      if (!docRes.ok || !docJson.success) {
        throw new Error(docJson.error?.userMessage || "Failed to create document record");
      }

      const newDoc = docJson.data;

      // 3. Optionally trigger processing right away
      if (autoProcess) {
        setUploadProgress("Initiating document digitization pipeline...");
        fetch(`/api/documents/${newDoc.id}/process`, {
          method: "POST",
        }).catch(() => {
          // background process
        });
      }

      toast.success("Land record document uploaded successfully!");
      setOpen(false);
      resetForm();
      onSuccess?.();
      router.push(`/documents/${newDoc.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDocumentType("ror");
    setStateName("Karnataka");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            <div>{trigger}</div>
          ) : (
            <Button size="sm" className="gap-2 font-mono text-xs shadow-xs">
              <HugeiconsIcon icon={Upload01Icon} className="size-4" />
              <span>Upload Land Record</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Upload Land Record Document
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Upload a scanned PDF or high-resolution image of an Indian land record for AI digitization.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "cursor-pointer border-2 border-dashed rounded-lg p-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/30 flex flex-col items-center justify-center gap-2",
              file ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/80 bg-muted/10"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp,image/tiff"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {file ? (
              <div className="flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
                <span className="font-mono truncate max-w-xs">{file.name}</span>
                <span className="text-muted-foreground font-mono">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <>
                <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <HugeiconsIcon icon={File01Icon} className="size-5" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-primary">Click to browse</span> or drag and drop
                </div>
                <p className="text-[11px] text-muted-foreground">
                  PDF, PNG, JPG, or WebP (up to 25 MB)
                </p>
              </>
            )}
          </div>

          {/* Document Title */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-title" className="text-xs font-medium">
              Document Title
            </Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Survey 103/2B RoR Devanahalli"
              required
              className="text-xs h-9"
            />
          </div>

          {/* State / Jurisdiction */}
          <div className="space-y-1.5">
            <Label htmlFor="state-name" className="text-xs font-medium">
              State / Jurisdiction
            </Label>
            <select
              id="state-name"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full text-xs h-9 rounded-md border border-input bg-transparent px-3 py-1 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" className="bg-background text-foreground">
                Auto-detect / Other State
              </option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state} className="bg-background text-foreground">
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type Selector (Radio Style) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Document Classification</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DOCUMENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setDocumentType(t.value)}
                  className={cn(
                    "flex flex-col text-left p-2 rounded-md border text-xs transition-colors",
                    documentType === t.value
                      ? "border-primary bg-primary/10 text-primary font-medium shadow-2xs"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  <span className="font-semibold">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto process checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="auto-process"
              checked={autoProcess}
              onChange={(e) => setAutoProcess(e.target.checked)}
              className="rounded border-border size-3.5 accent-primary"
            />
            <Label
              htmlFor="auto-process"
              className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer select-none"
            >
              <HugeiconsIcon icon={Layers01Icon} className="size-3 text-primary" />
              <span>Automatically digitize and extract record upon upload</span>
            </Label>
          </div>

          {/* Progress / Status indicator */}
          {uploadProgress && (
            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2 bg-muted/40 p-2 rounded">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              <span>{uploadProgress}</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isUploading || !file}
              className="gap-1.5 font-mono text-xs"
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-3.5" />
              <span>{isUploading ? "Uploading..." : "Upload & Continue"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
