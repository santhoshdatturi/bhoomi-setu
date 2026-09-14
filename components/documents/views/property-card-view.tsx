"use client";

import {
  Building01Icon,
  UserIcon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface PropertyCardViewProps {
  data: StructuredLandRecordExtraction | null;
}

export function PropertyCardView({ data }: PropertyCardViewProps) {
  if (!data) return null;

  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const extent = data.extent;
  const owners = data.owners || [];
  const primaryOwner = owners[0];
  const remarks = data.remarks || [];

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Property Card Header */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Building01Icon} className="size-3.5 text-muted-foreground" />
            <span>Urban Property Card (City Survey / CTS)</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            CTS No: {parcel?.plotNumber?.value || parcel?.surveyNumber?.value || "—"}
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">City / Town</span>
            <span className="font-semibold text-foreground">{location?.district?.value || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Ward / Locality</span>
            <span className="font-semibold text-foreground">{location?.village?.value || location?.taluk?.value || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">CTS / Property ID</span>
            <span className="font-semibold font-mono text-foreground">{parcel?.plotNumber?.value || parcel?.surveyNumber?.value || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Usage</span>
            <span className="font-semibold text-foreground">{extent?.landClassification?.value || "Urban Residential"}</span>
          </div>
        </div>
      </div>

      {/* 2. Property Holder Details */}
      <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs space-y-2">
        <div className="flex items-center gap-2 pb-1.5 border-b border-border/60 font-semibold text-foreground">
          <HugeiconsIcon icon={UserIcon} className="size-3.5 text-muted-foreground" />
          <span>Registered Property Holder</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Holder Name</span>
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
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Built-up / Plot Area</span>
            <div className="font-semibold text-foreground text-sm">
              {extent?.totalArea?.value ? `${extent.totalArea.value} ${extent.areaUnit?.value || "Sq. Mtr"}` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Municipal Tax Assessment */}
      {extent?.landRevenueTax?.value && (
        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Coins01Icon} className="size-4 text-primary" />
            <div>
              <span className="text-[10px] uppercase font-medium text-muted-foreground">Property Tax Assessment</span>
              <div className="font-semibold text-foreground">{extent.landRevenueTax.value}</div>
            </div>
          </div>
          <FieldConfidenceBadge confidence={extent.landRevenueTax.confidence} />
        </div>
      )}

      {/* 4. Remarks */}
      {remarks.length > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Property Card Remarks</span>
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
