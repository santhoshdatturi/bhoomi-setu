"use client";

import { useState } from "react";
import {
  ReloadIcon,
  Alert02Icon,
  Layers01Icon,
  File01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { FieldConfidenceBadge } from "./field-confidence-badge";
import {
  OwnershipView,
  ParcelView,
  CultivationView,
  MutationView,
  AccountHoldingView,
  EncumbranceView,
  SpatialMapView,
  PropertyCardView,
} from "./views";
import { toast } from "sonner";
import type { DocumentRecord } from "@/lib/db/types";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";
import type { DocumentErrorDetails } from "@/lib/validations/documents";

interface ExtractionPanelProps {
  document: DocumentRecord;
  onRefresh?: () => void;
}

export function ExtractionPanel({
  document,
  onRefresh,
}: ExtractionPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  const status = document.status;
  const errorDetails = document.errorDetails as DocumentErrorDetails | null;

  // Use document.extractedData as primary source
  const extractedObj = (document.extractedData as StructuredLandRecordExtraction | null) || null;

  const classification = extractedObj?.documentClassification;
  const confidenceScore = document.confidenceScore;

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/documents/${document.id}/process`, {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || json.error?.userMessage || "Extraction failed. Please try again.");
        onRefresh?.();
      } else {
        toast.success("Document digitized and extracted successfully!");
        onRefresh?.();
      }
    } catch {
      toast.error("An error occurred during document processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommit = async () => {
    setIsCommitting(true);
    try {
      const res = await fetch(`/api/documents/${document.id}/commit`, {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.userMessage || "Failed to commit record to canonical database.");
      } else {
        toast.success("Record committed to canonical database successfully!");
        onRefresh?.();
      }
    } catch {
      toast.error("An error occurred while committing record");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-muted/40 shrink-0">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Layers01Icon} className="size-4 text-primary" />
          <h2 className="text-xs font-semibold tracking-tight text-foreground font-sans">
            Extracted Land Record
          </h2>
          <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary uppercase">
            {status === "committed" ? "Canonical DB Record" : "Digitized Draft"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(status === "extracted" || status === "failed") && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleProcess}
              disabled={isProcessing || isCommitting}
              className="gap-1 font-sans text-xs h-7 px-2"
            >
              <HugeiconsIcon
                icon={ReloadIcon}
                className={`size-3 ${isProcessing ? "animate-spin" : ""}`}
              />
              <span>{isProcessing ? "Processing..." : "Reprocess"}</span>
            </Button>
          )}

          {status === "extracted" && (
            <Button
              size="xs"
              onClick={handleCommit}
              disabled={isProcessing || isCommitting}
              className="gap-1 font-sans text-xs h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className={`size-3 ${isCommitting ? "animate-spin" : ""}`}
              />
              <span>{isCommitting ? "Committing..." : "Approve & Commit"}</span>
            </Button>
          )}

          {status === "committed" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
              <span>Verified & Committed</span>
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 font-sans">
        {/* State 1: Uploaded (Not yet processed) */}
        {status === "uploaded" && !isProcessing && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-3">
            <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <HugeiconsIcon icon={File01Icon} className="size-5" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground">Ready for Digitization</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Run automated document extraction to parse parcel boundaries, khatedars, extent, land revenue, and mutation history.
              </p>
            </div>
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="gap-2 font-sans text-xs mt-1"
            >
              <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
              <span>Extract Land Record</span>
            </Button>
          </div>
        )}

        {/* State 2: Processing */}
        {(status === "processing" || isProcessing) && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
            <div className="relative size-12">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="relative size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/30">
                <HugeiconsIcon icon={ReloadIcon} className="size-6 animate-spin" />
              </div>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground">Digitizing Land Record</h3>
              <p className="text-xs text-muted-foreground">
                Analyzing scanned record, structuring khatedar tables, and calculating field certainty scores.
              </p>
            </div>
            <div className="w-full max-w-xs space-y-1 text-left text-[11px] bg-muted/40 p-2.5 rounded-md border border-border/60">
              <div className="flex items-center gap-2 text-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>Reading scanned document text...</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>Classifying jurisdiction & record format...</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Extracting parcel identifiers & owners...</span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Extraction Failure */}
        {status === "failed" && !isProcessing && (() => {
          const isTechnicalString = (str?: string | null) =>
            !str ||
            str.includes("Error:") ||
            str.includes("GoogleGenerativeAI") ||
            str.includes("at ") ||
            str.includes("http") ||
            str.includes("{") ||
            str.includes("TypeError") ||
            str.includes("Bad Request");

          // Determine user-facing message:
          // If cause contains a domain validation message (like "Jurisdiction Mismatch: ..."), prioritize it over generic text
          let displayMessage = errorDetails?.message || "Document digitization could not be completed for this file.";
          if (
            errorDetails?.cause &&
            !isTechnicalString(errorDetails.cause) &&
            (errorDetails.cause.startsWith("Jurisdiction Mismatch") ||
             displayMessage.includes("analyzing the document structure"))
          ) {
            displayMessage = errorDetails.cause;
          }

          const isJurisdictionNotice =
            displayMessage.toLowerCase().includes("jurisdiction mismatch") ||
            errorDetails?.errorType === "validation_error";

          return (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4">
              <div
                className={`size-12 rounded-full flex items-center justify-center ${
                  isJurisdictionNotice
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                <HugeiconsIcon icon={Alert02Icon} className="size-6" />
              </div>

              <div className="space-y-2 max-w-md w-full">
                <h3 className="text-sm font-semibold text-foreground">
                  {isJurisdictionNotice ? "Document Verification Notice" : "Digitization Incomplete"}
                </h3>

                <div
                  className={`text-xs p-3.5 rounded-lg border text-left space-y-1.5 ${
                    isJurisdictionNotice
                      ? "bg-amber-500/5 border-amber-500/20 text-foreground"
                      : "bg-muted/30 border-border/80 text-foreground"
                  }`}
                >
                  <p className="text-xs leading-relaxed font-medium">
                    {displayMessage}
                  </p>

                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {isJurisdictionNotice
                      ? "Please verify that the document matches the selected state jurisdiction, or re-upload the document with the appropriate state selected."
                      : "You can retry processing or upload a clearer scan of the document."}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleProcess}
                className="gap-2 font-sans text-xs"
              >
                <HugeiconsIcon icon={ReloadIcon} className="size-3.5" />
                <span>Retry Processing</span>
              </Button>
            </div>
          );
        })()}

        {/* State 4: Extracted or Committed Successfully */}
        {(status === "extracted" || status === "committed") && !isProcessing && (
          <div className="space-y-3">
            {/* Top Overview Banner */}
            <div className="rounded-md border border-border/80 bg-muted/30 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {classification?.documentTitle || "Record of Rights (RoR)"}
                </span>
                {classification?.state && classification.state !== "unknown" && (
                  <span className="text-[11px] text-muted-foreground">
                    • {classification.state}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {classification?.detectedLanguage && (
                  <span className="text-[11px] text-muted-foreground">
                    Language: {classification.detectedLanguage}
                  </span>
                )}
                {confidenceScore !== null && confidenceScore !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Overall Confidence:</span>
                    <FieldConfidenceBadge
                      confidence={confidenceScore}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Document-Type Specific View Component */}
            {(() => {
              switch (document.documentType) {
                case "ownership":
                  return <OwnershipView data={extractedObj} />;
                case "parcel":
                  return <ParcelView data={extractedObj} />;
                case "mutation":
                  return <MutationView data={extractedObj} />;
                case "cultivation":
                  return <CultivationView data={extractedObj} />;
                case "account_holding":
                  return <AccountHoldingView data={extractedObj} />;
                case "encumbrance":
                  return <EncumbranceView data={extractedObj} />;
                case "spatial_map":
                  return <SpatialMapView data={extractedObj} />;
                case "property_card":
                  return <PropertyCardView data={extractedObj} />;
                default:
                  return <OwnershipView data={extractedObj} />;
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
