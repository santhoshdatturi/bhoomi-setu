"use client";

import {
  UserIcon,
  Layers01Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface AccountHoldingViewProps {
  data: StructuredLandRecordExtraction | null;
}

export function AccountHoldingView({ data }: AccountHoldingViewProps) {
  if (!data) return null;

  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const extent = data.extent;
  const owners = data.owners || [];
  const primaryOwner = owners[0];
  const remarks = data.remarks || [];

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Account / Khata Holding Header */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Layers01Icon} className="size-3.5 text-muted-foreground" />
            <span>Account Holding (Khata / Form 8A)</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
            Account: {parcel?.khataNumber?.value || "—"}
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">State</span>
            <span className="font-semibold text-foreground block">{location?.state?.value || "—"}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">District</span>
            <span className="font-semibold text-foreground block">{location?.district?.value || "—"}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Taluk</span>
            <span className="font-semibold text-foreground block">{location?.taluk?.value || "—"}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Village</span>
            <span className="font-semibold text-foreground block">{location?.village?.value || "—"}</span>
          </div>
        </div>
      </div>

      {/* 2. Khata Holder & Details */}
      <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs space-y-2">
        <div className="flex items-center gap-2 pb-1.5 border-b border-border/60 font-semibold text-foreground">
          <HugeiconsIcon icon={UserIcon} className="size-3.5 text-muted-foreground" />
          <span>Account Holder</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Owner Name</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">{primaryOwner?.name || "—"}</span>
              {primaryOwner && primaryOwner.confidence > 0 && <FieldConfidenceBadge confidence={primaryOwner.confidence} />}
            </div>
            {primaryOwner?.relativeName && (
              <div className="text-muted-foreground text-[11px]">
                {primaryOwner.relationshipType || "Relative"}: {primaryOwner.relativeName}
              </div>
            )}
            {primaryOwner?.evidence && <FieldEvidenceQuote evidence={primaryOwner.evidence} />}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Total Holding Area</span>
            <div className="font-semibold text-foreground text-sm">
              {extent?.totalArea?.value ? `${extent.totalArea.value} ${extent.areaUnit?.value || ""}` : "—"}
            </div>
            <div className="text-muted-foreground text-[11px]">
              Land Summary: {extent?.landClassification?.value || "Agricultural Holding"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tax Assessment */}
      {extent?.landRevenueTax?.value && (
        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Coins01Icon} className="size-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase font-medium text-muted-foreground">Land Revenue Assessment</span>
              <div className="font-semibold text-foreground">{extent.landRevenueTax.value}</div>
            </div>
          </div>
          <FieldConfidenceBadge confidence={extent.landRevenueTax.confidence} />
        </div>
      )}

      {/* 4. Remarks */}
      {remarks.length > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Holding Notes</span>
          <ul className="list-disc list-inside text-foreground/90 space-y-0.5">
            {remarks.map((rem, i) => (
              <li key={i}>{rem}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
