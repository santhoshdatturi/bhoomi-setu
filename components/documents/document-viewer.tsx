"use client";

import { useState } from "react";
import {
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
  ReloadIcon,
  Download01Icon,
  File01Icon,
  File02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  fileName: string;
  documentType: string;
  downloadUrl?: string | null;
  mimeType?: string | null;
  className?: string;
}

export function DocumentViewer({
  fileName,
  documentType,
  downloadUrl,
  mimeType = "application/pdf",
  className,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  const isPdf = mimeType?.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
  const isImage =
    mimeType?.includes("image") ||
    /\.(jpg|jpeg|png|webp|tif|tiff)$/i.test(fileName);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => {
    setZoom(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <HugeiconsIcon icon={File02Icon} className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-xs font-medium truncate" title={fileName}>
            {fileName}
          </span>
          <span className="text-[10px] font-mono uppercase bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
            {documentType}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isImage && (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                title="Zoom Out"
              >
                <HugeiconsIcon icon={ZoomOutAreaIcon} className="size-3.5" />
              </Button>
              <span className="text-[11px] font-mono tabular-nums px-1 text-muted-foreground">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomIn}
                disabled={zoom >= 250}
                title="Zoom In"
              >
                <HugeiconsIcon icon={ZoomInAreaIcon} className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleRotate}
                title="Rotate 90 deg"
              >
                <HugeiconsIcon icon={ReloadIcon} className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleResetZoom}
                className="text-[11px] h-6 px-1.5"
              >
                Reset
              </Button>
            </>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={fileName}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
            >
              <HugeiconsIcon icon={Download01Icon} className="size-3" />
              <span>Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 min-h-0 overflow-auto bg-muted/20 relative flex items-center justify-center p-3">
        {downloadUrl ? (
          isPdf ? (
            <iframe
              src={`${downloadUrl}#toolbar=0&navpanes=0`}
              title={fileName}
              className="w-full h-full rounded border border-border/60 bg-white"
            />
          ) : isImage ? (
            <div
              className="transition-transform duration-150 origin-center max-h-full max-w-full flex items-center justify-center"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={downloadUrl}
                alt={fileName}
                className="max-w-full max-h-[calc(100vh-10rem)] object-contain rounded shadow-xs border border-border/70"
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
                className="inline-flex items-center gap-1.5 mt-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
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
            <div className="rounded-md border border-border/70 bg-card p-3 text-left space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document Type:</span>
                <span className="font-mono uppercase">{documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MIME Format:</span>
                <span className="font-mono">{mimeType}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
