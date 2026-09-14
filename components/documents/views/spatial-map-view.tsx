"use client";

import {
  Compass01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface SpatialMapViewProps {
  data: StructuredLandRecordExtraction | null;
}

export function SpatialMapView({ data }: SpatialMapViewProps) {
  if (!data) return null;

  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const extent = data.extent;
  const remarks = data.remarks || [];

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Spatial Header */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Compass01Icon} className="size-3.5 text-muted-foreground" />
            <span>Cadastral Spatial Map & Survey Boundaries</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            FMB / Tippan
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">District</span>
            <span className="font-semibold text-foreground">{location?.district?.value || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Village</span>
            <span className="font-semibold text-foreground">{location?.village?.value || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Survey Number</span>
            <span className="font-semibold font-mono text-foreground">{parcel?.surveyNumber?.value || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Sub-Division</span>
            <span className="font-semibold font-mono text-foreground">{parcel?.subDivision?.value || "—"}</span>
          </div>
        </div>
      </div>

      {/* 2. Map Coordinates & Sheet Information */}
      <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs space-y-2">
        <div className="flex items-center gap-2 pb-1.5 border-b border-border/60 font-semibold text-foreground">
          <HugeiconsIcon icon={Layers01Icon} className="size-3.5 text-muted-foreground" />
          <span>Cadastral Sheet Details</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Map Sheet No</span>
            <div className="font-mono font-semibold text-foreground">{parcel?.oldSurveyNumber?.value || "Sheet 1/A"}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Total Area</span>
            <div className="font-semibold text-foreground">
              {extent?.totalArea?.value ? `${extent.totalArea.value} ${extent.areaUnit?.value || "Ha"}` : "—"}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Boundary Shape</span>
            <div className="text-muted-foreground">Cadastral Polygon Available</div>
          </div>
        </div>
      </div>

      {/* 3. Remarks */}
      {remarks.length > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Spatial Notes</span>
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
