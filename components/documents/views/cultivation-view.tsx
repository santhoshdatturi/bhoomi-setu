"use client";

import {
  Location01Icon,
  UserIcon,
  Building01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface CultivationViewProps {
  data: StructuredLandRecordExtraction | null;
}

export function CultivationView({ data }: CultivationViewProps) {
  if (!data) return null;

  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const extent = data.extent;
  const owners = data.owners || [];
  const primaryCultivator = owners[0];
  const remarks = data.remarks || [];

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Header & Location */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-muted-foreground" />
            <span>Agricultural Register (Adangal / Pahani / Cultivation)</span>
          </div>
          {parcel?.surveyNumber?.value && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Survey: {parcel.surveyNumber.value}{parcel.subDivision?.value ? `/${parcel.subDivision.value}` : ""}
            </span>
          )}
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Khata No</span>
            <span className="font-semibold text-foreground font-mono block">{parcel?.khataNumber?.value || "—"}</span>
          </div>
        </div>
      </div>

      {/* 2. Cultivator & Tenancy */}
      <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs space-y-2">
        <div className="flex items-center gap-2 pb-1.5 border-b border-border/60 font-semibold text-foreground">
          <HugeiconsIcon icon={UserIcon} className="size-3.5 text-muted-foreground" />
          <span>Cultivator / Occupant</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Cultivator Name</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">{primaryCultivator?.name || "—"}</span>
              {primaryCultivator && primaryCultivator.confidence > 0 && <FieldConfidenceBadge confidence={primaryCultivator.confidence} />}
            </div>
            {primaryCultivator?.relativeName && (
              <div className="text-muted-foreground text-[11px]">
                {primaryCultivator.relationshipType || "Relative"}: {primaryCultivator.relativeName}
              </div>
            )}
            {primaryCultivator?.evidence && <FieldEvidenceQuote evidence={primaryCultivator.evidence} />}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Tenancy / Possession</span>
            <div className="font-medium text-foreground">
              {primaryCultivator?.ownershipType || "Owner Cultivation / Self"}
            </div>
            {primaryCultivator?.share && (
              <div className="text-muted-foreground text-[11px]">Share: {primaryCultivator.share}</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Crop & Cultivated Extents */}
      <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs space-y-2">
        <div className="flex items-center gap-2 pb-1.5 border-b border-border/60 font-semibold text-foreground">
          <HugeiconsIcon icon={Building01Icon} className="size-3.5 text-muted-foreground" />
          <span>Crop Details & Extents</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Total Extent</span>
            <div className="font-semibold text-foreground">
              {extent?.totalArea?.value ? `${extent.totalArea.value} ${extent.areaUnit?.value || ""}` : "—"}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Cultivated Extent</span>
            <div className="font-medium text-foreground">
              {extent?.cultivatedArea?.value || extent?.totalArea?.value || "—"}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Land Classification</span>
            <div className="font-medium text-foreground">{extent?.landClassification?.value || "Wet / Irrigated"}</div>
          </div>
        </div>
      </div>

      {/* 4. Remarks */}
      {remarks.length > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Crop Remarks</span>
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
