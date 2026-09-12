"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  ReloadIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DocumentViewer } from "./document-viewer";
import { ExtractionPanel } from "./extraction-panel";
import type { DocumentRecord, ExtractionRecord } from "@/lib/db/types";

interface DocumentWorkspaceProps {
  initialDocument: DocumentRecord;
  initialExtraction: ExtractionRecord | null;
  initialDownloadUrl?: string | null;
}

export function DocumentWorkspace({
  initialDocument,
  initialExtraction,
  initialDownloadUrl,
}: DocumentWorkspaceProps) {
  const [document, setDocument] = useState<DocumentRecord>(initialDocument);
  const [extraction, setExtraction] = useState<ExtractionRecord | null>(initialExtraction);
  const [downloadUrl, setDownloadUrl] = useState(initialDownloadUrl);

  const fetchDocumentDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${initialDocument.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDocument(json.data.document);
          setExtraction(json.data.extraction);
          if (json.data.downloadUrl) {
            setDownloadUrl(json.data.downloadUrl);
          }
        }
      }
    } catch {
      // Ignored
    }
  }, [initialDocument.id]);

  // If status is processing, poll every 3 seconds until completed
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (document.status === "processing") {
      interval = setInterval(() => {
        fetchDocumentDetails();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [document.status, fetchDocumentDetails]);

  // Status badge helper
  const renderStatusBadge = () => {
    switch (document.status) {
      case "uploaded":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium border border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-400">
            <HugeiconsIcon icon={Clock01Icon} className="size-3" />
            <span>Uploaded</span>
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400 animate-pulse">
            <HugeiconsIcon icon={ReloadIcon} className="size-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case "extracted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
            <span>Extracted</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400">
            <HugeiconsIcon icon={Alert02Icon} className="size-3" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Header & Breadcrumbs */}
      <header className="h-11 px-4 border-b border-border bg-card/60 backdrop-blur-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
            <span>Documents</span>
          </Link>

          <div className="h-3.5 w-px bg-border shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs font-semibold truncate text-foreground">
              {document.title}
            </h1>
            <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
              ({document.fileName})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-sans uppercase bg-muted/80 text-muted-foreground border border-border px-1.5 py-0.5 rounded font-medium">
            {document.documentType}
          </span>
          {renderStatusBadge()}
        </div>
      </header>

      {/* Main Side-by-Side Split Workspace */}
      <main className="flex-1 min-h-0 p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden">
        {/* Left Pane: Original Document */}
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <DocumentViewer
            fileName={document.fileName}
            documentType={document.documentType}
            downloadUrl={downloadUrl}
          />
        </div>

        {/* Right Pane: Structured Extraction */}
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <ExtractionPanel
            document={document}
            extraction={extraction}
            onRefresh={fetchDocumentDetails}
          />
        </div>
      </main>
    </div>
  );
}
