"use client";

import { useState } from "react";
import {
  Download01Icon,
  File01Icon,
  File02Icon,
  LinkSquare02Icon,
  MaximizeIcon,
  MinimizeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  fileName: string;
  documentType?: string;
  downloadUrl?: string | null;
  mimeType?: string | null;
  className?: string;
}

export function DocumentViewer({
  fileName,
  downloadUrl,
  mimeType = "application/pdf",
  className,
}: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isPdf = mimeType?.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
  const isImage =
    mimeType?.includes("image") ||
    /\.(jpg|jpeg|png|webp|tif|tiff)$/i.test(fileName);

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden shadow-xs relative",
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-background" : "",
        className
      )}
    >
      {/* Header Toolbar */}
      <div className="h-11 px-3.5 border-b border-border bg-muted/40 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <HugeiconsIcon icon={File02Icon} className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-xs font-semibold truncate text-foreground" title={fileName}>
            {fileName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Fullscreen Viewer Toggle */}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Viewer"}
            className="h-7 px-2 text-xs font-sans gap-1 bg-card hover:bg-muted text-foreground cursor-pointer"
          >
            <HugeiconsIcon
              icon={isFullscreen ? MinimizeIcon : MaximizeIcon}
              className="size-3.5"
            />
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </Button>

          {downloadUrl && (
            <>
              {/* Open in New Tab */}
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors text-foreground h-7"
              >
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                <span>Open in Tab</span>
              </a>

              {/* Direct Download */}
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors text-foreground h-7"
              >
                <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                <span>Download</span>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="flex-1 min-h-0 overflow-auto bg-muted/20 flex items-center justify-center p-3">
        {downloadUrl ? (
          isPdf ? (
            <iframe
              src={downloadUrl}
              title={fileName}
              className="w-full h-full border-0 bg-white rounded shadow-2xs"
            />
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={downloadUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded shadow-sm border border-border/70"
              />
            </div>
          ) : (
            <div className="text-center p-6 space-y-2">
              <HugeiconsIcon icon={File01Icon} className="size-10 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                Document preview is available via direct download.
              </p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                <span>Download Document</span>
              </a>
            </div>
          )
        ) : (
          <div className="text-center p-8 space-y-3 max-w-sm">
            <div className="size-12 rounded-full bg-muted/80 flex items-center justify-center mx-auto border border-border">
              <HugeiconsIcon icon={File02Icon} className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Original scan document registered for digitization.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
