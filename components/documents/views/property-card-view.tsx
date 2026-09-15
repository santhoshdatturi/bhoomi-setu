"use client";

import {
  Building01Icon,
  UserIcon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Input } from "@/components/ui/input";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface PropertyCardViewProps {
  data: StructuredLandRecordExtraction | null;
  isEditing?: boolean;
  onChange?: (updated: StructuredLandRecordExtraction) => void;
}

export function PropertyCardView({ data, isEditing = false, onChange }: PropertyCardViewProps) {
  if (!data) return null;

  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const extent = data.extent;
  const owners = data.owners || [];
  const primaryOwner = owners[0];
  const remarks = data.remarks || [];

  const handleUpdate = (updater: (prev: StructuredLandRecordExtraction) => StructuredLandRecordExtraction) => {
    if (!onChange) return;
    const clone: StructuredLandRecordExtraction = JSON.parse(JSON.stringify(data));
    const next = updater(clone);
    onChange(next);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Property Card Header */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Building01Icon} className="size-3.5 text-muted-foreground" />
            <span>Urban Property Card (City Survey / CTS)</span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-muted-foreground">CTS No:</span>
              <Input
                value={parcel?.plotNumber?.value || parcel?.surveyNumber?.value || ""}
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
                className="h-7 text-xs font-mono w-28 bg-background"
                placeholder="CTS No."
              />
            </div>
          ) : (
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              CTS No: {parcel?.plotNumber?.value || parcel?.surveyNumber?.value || "—"}
            </span>
          )}
        </div>

        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block mb-1">City / Town</span>
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
                placeholder="City"
              />
            ) : (
              <span className="font-semibold text-foreground">{location?.district?.value || "—"}</span>
            )}
          </div>

          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block mb-1">Ward / Locality</span>
            {isEditing ? (
              <Input
                value={location?.village?.value || location?.taluk?.value || ""}
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
                placeholder="Ward / Locality"
              />
            ) : (
              <span className="font-semibold text-foreground">{location?.village?.value || location?.taluk?.value || "—"}</span>
            )}
          </div>

          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block mb-1">CTS / Property ID</span>
            {isEditing ? (
              <Input
                value={parcel?.plotNumber?.value || parcel?.surveyNumber?.value || ""}
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
                placeholder="Property ID"
              />
            ) : (
              <span className="font-semibold font-mono text-foreground">{parcel?.plotNumber?.value || parcel?.surveyNumber?.value || "—"}</span>
            )}
          </div>

          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block mb-1">Usage</span>
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
                placeholder="e.g. Residential"
              />
            ) : (
              <span className="font-semibold text-foreground">{extent?.landClassification?.value || "Urban Residential"}</span>
            )}
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
          <div className="space-y-1.5">
            <span className="text-muted-foreground text-[10px] uppercase font-medium block">Holder Name</span>
            {isEditing ? (
              <div className="space-y-1.5">
                <Input
                  value={primaryOwner?.name || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleUpdate((prev) => {
                      if (!prev.owners || prev.owners.length === 0) {
                        prev.owners = [
                          {
                            surveyNumber: "",
                            subDivision: "",
                            khataNumber: "",
                            name: val,
                            relationshipType: "",
                            relativeName: "",
                            share: "",
                            ownershipType: "",
                            idReference: "",
                            confidence: 100,
                            evidence: "Manual edit",
                          },
                        ];
                      } else {
                        prev.owners[0].name = val;
                        prev.owners[0].confidence = 100;
                      }
                      return prev;
                    });
                  }}
                  className="h-7 text-xs bg-background font-medium"
                  placeholder="Holder Name"
                />

                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    value={primaryOwner?.relationshipType || "Son of"}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdate((prev) => {
                        if (prev.owners?.[0]) prev.owners[0].relationshipType = val;
                        return prev;
                      });
                    }}
                    className="h-7 text-xs bg-background"
                    placeholder="Relation Type"
                  />
                  <Input
                    value={primaryOwner?.relativeName || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdate((prev) => {
                        if (prev.owners?.[0]) prev.owners[0].relativeName = val;
                        return prev;
                      });
                    }}
                    className="h-7 text-xs bg-background"
                    placeholder="Relative Name"
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-muted-foreground text-[10px] uppercase font-medium block">Built-up / Plot Area</span>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-1.5">
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
                  className="h-7 text-xs bg-background"
                  placeholder="Area"
                />
                <Input
                  value={extent?.areaUnit?.value || "Sq. Mtr"}
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
                  className="h-7 text-xs bg-background"
                  placeholder="Unit"
                />
              </div>
            ) : (
              <div className="font-semibold text-foreground text-sm">
                {extent?.totalArea?.value ? `${extent.totalArea.value} ${extent.areaUnit?.value || "Sq. Mtr"}` : "—"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Municipal Tax Assessment */}
      <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 w-full">
          <HugeiconsIcon icon={Coins01Icon} className="size-4 text-primary shrink-0" />
          <div className="w-full">
            <span className="text-[10px] uppercase font-medium text-muted-foreground block">Property Tax Assessment</span>
            {isEditing ? (
              <Input
                value={extent?.landRevenueTax?.value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate((prev) => {
                    if (!prev.extent) prev.extent = {};
                    prev.extent.landRevenueTax = {
                      value: val,
                      confidence: 100,
                      evidence: prev.extent.landRevenueTax?.evidence || "Manual edit",
                    };
                    return prev;
                  });
                }}
                className="h-7 text-xs bg-background max-w-xs mt-1"
                placeholder="e.g. ₹4,500 / year"
              />
            ) : (
              <div className="font-semibold text-foreground">{extent?.landRevenueTax?.value || "Not Assessed"}</div>
            )}
          </div>
        </div>
        {!isEditing && extent?.landRevenueTax?.confidence !== undefined && (
          <FieldConfidenceBadge confidence={extent.landRevenueTax.confidence} />
        )}
      </div>

      {/* 4. Remarks */}
      <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
        <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider block">Property Card Remarks</span>
        {isEditing ? (
          <Input
            value={remarks.join("; ")}
            onChange={(e) => {
              const val = e.target.value;
              handleUpdate((prev) => {
                prev.remarks = val.split(";").map((s) => s.trim()).filter(Boolean);
                return prev;
              });
            }}
            className="h-7 text-xs bg-background mt-1"
            placeholder="Remarks (semicolon separated)"
          />
        ) : remarks.length > 0 ? (
          <ul className="list-disc list-inside text-foreground/90 space-y-0.5">
            {remarks.map((rem, i) => (
              <li key={i}>{rem}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic text-[11px]">No remarks noted</p>
        )}
      </div>
    </div>
  );
}
