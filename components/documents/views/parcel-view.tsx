"use client";

import {
  Layers01Icon,
  Location01Icon,
  Building01Icon,
  Compass01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Input } from "@/components/ui/input";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface ParcelViewProps {
  data: StructuredLandRecordExtraction | null;
  isEditing?: boolean;
  onChange?: (updated: StructuredLandRecordExtraction) => void;
}

function hasValue(field?: { value?: string | null; confidence?: number }) {
  return Boolean(field?.value && field.value.trim().length > 0 && (field.confidence ?? 0) > 0);
}

export function ParcelView({ data, isEditing = false, onChange }: ParcelViewProps) {
  if (!data) return null;

  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const extent = data.extent;
  const records = data.records || [];

  const handleUpdate = (updater: (prev: StructuredLandRecordExtraction) => StructuredLandRecordExtraction) => {
    if (!onChange) return;
    const clone: StructuredLandRecordExtraction = JSON.parse(JSON.stringify(data));
    const next = updater(clone);
    onChange(next);
  };

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
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">State</span>
            {isEditing ? (
              <Input
                value={location?.state?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.location) prev.location = {};
                    prev.location.state = {
                      value: val,
                      confidence: 100,
                      evidence: prev.location.state?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs bg-background"
                placeholder="State"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{location?.state?.value || "—"}</span>
                {location?.state && location.state.value && <FieldConfidenceBadge confidence={location.state.confidence} />}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">District</span>
            {isEditing ? (
              <Input
                value={location?.district?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.location) prev.location = {};
                    prev.location.district = {
                      value: val,
                      confidence: 100,
                      evidence: prev.location.district?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs bg-background"
                placeholder="District"
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{location?.district?.value || "—"}</span>
                  {location?.district && location.district.value && <FieldConfidenceBadge confidence={location.district.confidence} />}
                </div>
                {location?.district?.evidence && <FieldEvidenceQuote evidence={location.district.evidence} />}
              </>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Taluk / Sub-District</span>
            {isEditing ? (
              <Input
                value={location?.taluk?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.location) prev.location = {};
                    prev.location.taluk = {
                      value: val,
                      confidence: 100,
                      evidence: prev.location.taluk?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs bg-background"
                placeholder="Taluk"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{location?.taluk?.value || "—"}</span>
                {location?.taluk && location.taluk.value && <FieldConfidenceBadge confidence={location.taluk.confidence} />}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Village / Locality</span>
            {isEditing ? (
              <Input
                value={location?.village?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.location) prev.location = {};
                    prev.location.village = {
                      value: val,
                      confidence: 100,
                      evidence: prev.location.village?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs bg-background"
                placeholder="Village"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{location?.village?.value || "—"}</span>
                {location?.village && location.village.value && <FieldConfidenceBadge confidence={location.village.confidence} />}
              </div>
            )}
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
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Survey Number</span>
            {isEditing ? (
              <Input
                value={parcel?.surveyNumber?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.parcelIdentifiers) prev.parcelIdentifiers = {};
                    prev.parcelIdentifiers.surveyNumber = {
                      value: val,
                      confidence: 100,
                      evidence: prev.parcelIdentifiers.surveyNumber?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs font-mono bg-background"
                placeholder="Survey No"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground font-mono">{parcel?.surveyNumber?.value || "—"}</span>
                {parcel?.surveyNumber && parcel.surveyNumber.value && <FieldConfidenceBadge confidence={parcel.surveyNumber.confidence} />}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Sub-Division / Hissa</span>
            {isEditing ? (
              <Input
                value={parcel?.subDivision?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.parcelIdentifiers) prev.parcelIdentifiers = {};
                    prev.parcelIdentifiers.subDivision = {
                      value: val,
                      confidence: 100,
                      evidence: prev.parcelIdentifiers.subDivision?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs font-mono bg-background"
                placeholder="Sub-Division"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground font-mono">{parcel?.subDivision?.value || "—"}</span>
                {parcel?.subDivision && parcel.subDivision.value && <FieldConfidenceBadge confidence={parcel.subDivision.confidence} />}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Plot Number</span>
            {isEditing ? (
              <Input
                value={parcel?.plotNumber?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.parcelIdentifiers) prev.parcelIdentifiers = {};
                    prev.parcelIdentifiers.plotNumber = {
                      value: val,
                      confidence: 100,
                      evidence: prev.parcelIdentifiers.plotNumber?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs font-mono bg-background"
                placeholder="Plot No"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground font-mono">{parcel?.plotNumber?.value || parcel?.surveyNumber?.value || "—"}</span>
                {parcel?.plotNumber && parcel.plotNumber.value && <FieldConfidenceBadge confidence={parcel.plotNumber.confidence} />}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Khata Number</span>
            {isEditing ? (
              <Input
                value={parcel?.khataNumber?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.parcelIdentifiers) prev.parcelIdentifiers = {};
                    prev.parcelIdentifiers.khataNumber = {
                      value: val,
                      confidence: 100,
                      evidence: prev.parcelIdentifiers.khataNumber?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs font-mono bg-background"
                placeholder="Khata No"
              />
            ) : (
              hasValue(parcel?.khataNumber) && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground font-mono">{parcel?.khataNumber?.value}</span>
                  <FieldConfidenceBadge confidence={parcel?.khataNumber?.confidence} />
                </div>
              )
            )}
          </div>
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
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Total Extent</span>
            {isEditing ? (
              <div className="flex gap-1">
                <Input
                  value={extent?.totalArea?.value || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleUpdate((prev) => {
                      if (!prev.extent) prev.extent = {};
                      prev.extent.totalArea = {
                        value: val,
                        confidence: 100,
                        evidence: prev.extent.totalArea?.evidence || "Manual edit",
                      };
                      return prev;
                    });
                  }}
                  className="h-7 text-xs font-mono bg-background flex-1"
                  placeholder="Area"
                />
                <Input
                  value={extent?.areaUnit?.value || "Ha"}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleUpdate((prev) => {
                      if (!prev.extent) prev.extent = {};
                      prev.extent.areaUnit = {
                        value: val,
                        confidence: 100,
                        evidence: prev.extent.areaUnit?.evidence || "Manual edit",
                      };
                      return prev;
                    });
                  }}
                  className="h-7 text-xs font-mono w-14 bg-background"
                  placeholder="Unit"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {extent?.totalArea?.value || "—"} {extent?.areaUnit?.value || ""}
                </span>
                {extent?.totalArea && extent.totalArea.value && <FieldConfidenceBadge confidence={extent.totalArea.confidence} />}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Land Classification</span>
            {isEditing ? (
              <Input
                value={extent?.landClassification?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.extent) prev.extent = {};
                    prev.extent.landClassification = {
                      value: val,
                      confidence: 100,
                      evidence: prev.extent.landClassification?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs bg-background"
                placeholder="Classification"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{extent?.landClassification?.value || "—"}</span>
                {extent?.landClassification && extent.landClassification.value && (
                  <FieldConfidenceBadge confidence={extent.landClassification.confidence} />
                )}
              </div>
            )}
          </div>
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
