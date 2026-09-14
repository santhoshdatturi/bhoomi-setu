"use client";

import {
  Layers01Icon,
  Location01Icon,
  Building01Icon,
  Compass01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface ParcelViewProps {
  data: StructuredLandRecordExtraction | null;
}

function hasValue(field?: { value?: string | null; confidence?: number }) {
  return Boolean(field?.value && field.value.trim().length > 0 && (field.confidence ?? 0) > 0);
}

export function ParcelView({ data }: ParcelViewProps) {
  if (!data) return null;

  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const extent = data.extent;
  const records = data.records || [];

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Location & Jurisdiction */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-muted-foreground" />
            <span>Cadastral Jurisdiction</span>
          </div>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">State</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{location?.state?.value || "—"}</span>
              {location?.state && location.state.value && <FieldConfidenceBadge confidence={location.state.confidence} />}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">District</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{location?.district?.value || "—"}</span>
              {location?.district && location.district.value && <FieldConfidenceBadge confidence={location.district.confidence} />}
            </div>
            {location?.district?.evidence && <FieldEvidenceQuote evidence={location.district.evidence} />}
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Taluk / Sub-District</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{location?.taluk?.value || "—"}</span>
              {location?.taluk && location.taluk.value && <FieldConfidenceBadge confidence={location.taluk.confidence} />}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Village / Locality</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{location?.village?.value || "—"}</span>
              {location?.village && location.village.value && <FieldConfidenceBadge confidence={location.village.confidence} />}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Parcel Identifiers */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Layers01Icon} className="size-3.5 text-muted-foreground" />
            <span>Cadastral Parcel Identifiers</span>
          </div>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Survey Number</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground font-mono">{parcel?.surveyNumber?.value || "—"}</span>
              {parcel?.surveyNumber && parcel.surveyNumber.value && <FieldConfidenceBadge confidence={parcel.surveyNumber.confidence} />}
            </div>
            {parcel?.surveyNumber?.evidence && <FieldEvidenceQuote evidence={parcel.surveyNumber.evidence} />}
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Sub-Division / Hissa</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground font-mono">{parcel?.subDivision?.value || "—"}</span>
              {parcel?.subDivision && parcel.subDivision.value && <FieldConfidenceBadge confidence={parcel.subDivision.confidence} />}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Plot Number</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground font-mono">{parcel?.plotNumber?.value || parcel?.surveyNumber?.value || "—"}</span>
              {parcel?.plotNumber && parcel.plotNumber.value && <FieldConfidenceBadge confidence={parcel.plotNumber.confidence} />}
            </div>
          </div>

          {hasValue(parcel?.khataNumber) && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Khata Number</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground font-mono">{parcel?.khataNumber?.value}</span>
                <FieldConfidenceBadge confidence={parcel?.khataNumber?.confidence} />
              </div>
            </div>
          )}

          {hasValue(parcel?.pattaNumber) && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Patta Number</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground font-mono">{parcel?.pattaNumber?.value}</span>
                <FieldConfidenceBadge confidence={parcel?.pattaNumber?.confidence} />
              </div>
            </div>
          )}

          {hasValue(parcel?.oldSurveyNumber) && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Old Survey No</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground font-mono">{parcel?.oldSurveyNumber?.value}</span>
                <FieldConfidenceBadge confidence={parcel?.oldSurveyNumber?.confidence} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Parcel Extent & Physical Classification */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Building01Icon} className="size-3.5 text-muted-foreground" />
            <span>Parcel Area & Classification</span>
          </div>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Total Extent</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                {extent?.totalArea?.value || "—"} {extent?.areaUnit?.value || ""}
              </span>
              {extent?.totalArea && extent.totalArea.value && <FieldConfidenceBadge confidence={extent.totalArea.confidence} />}
            </div>
            {extent?.totalArea?.evidence && <FieldEvidenceQuote evidence={extent.totalArea.evidence} />}
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Land Classification</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{extent?.landClassification?.value || "—"}</span>
              {extent?.landClassification && extent.landClassification.value && (
                <FieldConfidenceBadge confidence={extent.landClassification.confidence} />
              )}
            </div>
          </div>

          {hasValue(extent?.cultivatedArea) && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Cultivated Area</span>
              <span className="font-semibold text-foreground">{extent?.cultivatedArea?.value}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Multi-Plot Breakdown Table (if multiple parcels exist) */}
      {records.length > 1 && (
        <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
          <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Compass01Icon} className="size-3.5 text-muted-foreground" />
              <span>Multi-Plot Cadastral Breakdown ({records.length} Plots)</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2 px-3">Plot / Survey</th>
                  <th className="py-2 px-3">Sub-division</th>
                  <th className="py-2 px-3 text-right">Area</th>
                  <th className="py-2 px-3">Classification</th>
                  <th className="py-2 px-3">Possession</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {records.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="py-2 px-3 font-mono font-medium text-foreground">
                      {rec.surveyNumber || rec.plotNumber || `Plot ${idx + 1}`}
                    </td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">
                      {rec.subDivision || "—"}
                    </td>
                    <td className="py-2 px-3 font-mono text-right text-foreground font-semibold">
                      {rec.area ? `${rec.area} ${rec.areaUnit || ""}` : "—"}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {rec.landClassification || "—"}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {rec.natureOfPossession || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
