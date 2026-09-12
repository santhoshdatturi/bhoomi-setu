"use client";

import { useState } from "react";
import {
  ReloadIcon,
  Alert02Icon,
  Location01Icon,
  Layers01Icon,
  UserIcon,
  Building01Icon,
  CodeIcon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { FieldConfidenceBadge } from "./field-confidence-badge";
import { FieldEvidenceQuote } from "./field-evidence-quote";
import { toast } from "sonner";
import type {
  DocumentRecord,
  ExtractionRecord,
} from "@/lib/db/types";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface ExtractionPanelProps {
  document: DocumentRecord;
  extraction: ExtractionRecord | null;
  onRefresh?: () => void;
}

export function ExtractionPanel({
  document,
  extraction,
  onRefresh,
}: ExtractionPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const status = document.status;

  // Safe cast of jsonb fields directly from extraction record
  const classification = extraction?.documentClassification as
    | StructuredLandRecordExtraction["documentClassification"]
    | undefined;
  const location = extraction?.location as
    | StructuredLandRecordExtraction["location"]
    | undefined;
  const parcel = extraction?.parcelIdentifiers as
    | StructuredLandRecordExtraction["parcelIdentifiers"]
    | undefined;
  const owners = (extraction?.owners as
    | StructuredLandRecordExtraction["owners"]
    | undefined) || [];
  const extent = extraction?.extent as
    | StructuredLandRecordExtraction["extent"]
    | undefined;
  const mutation = extraction?.mutationInformation as
    | StructuredLandRecordExtraction["mutationInformation"]
    | undefined;
  const registration = extraction?.registrationInformation as
    | StructuredLandRecordExtraction["registrationInformation"]
    | undefined;
  const liabilities = (extraction?.liabilities as
    | StructuredLandRecordExtraction["liabilities"]
    | undefined) || [];
  const remarks = (extraction?.remarks as string[] | undefined) || [];

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/documents/${document.id}/process`, {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.userMessage || "Extraction failed. Please try again.");
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
            Digitized Draft
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(status === "extracted" || status === "failed") && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleProcess}
              disabled={isProcessing}
              className="gap-1 font-sans text-xs h-7 px-2"
            >
              <HugeiconsIcon
                icon={ReloadIcon}
                className={`size-3 ${isProcessing ? "animate-spin" : ""}`}
              />
              <span>{isProcessing ? "Processing..." : "Reprocess"}</span>
            </Button>
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
        {status === "failed" && !isProcessing && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-3">
            <div className="size-11 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <HugeiconsIcon icon={Alert02Icon} className="size-5" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground">Extraction Incomplete</h3>
              <p className="text-xs text-muted-foreground">
                {extraction?.errorMessage ||
                  "The digitization system could not complete structured extraction for this file."}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleProcess}
              className="gap-1.5 font-sans text-xs"
            >
              <HugeiconsIcon icon={ReloadIcon} className="size-3.5" />
              <span>Retry Processing</span>
            </Button>
          </div>
        )}

        {/* State 4: Extracted Successfully */}
        {status === "extracted" && !isProcessing && extraction && (
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
                {extraction.confidenceScore !== null && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Overall Confidence:</span>
                    <FieldConfidenceBadge
                      confidence={extraction.confidenceScore}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 1: Location & Jurisdiction */}
            <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
              <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
                <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-muted-foreground" />
                  <span>Location & Jurisdiction</span>
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">State</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{location?.state?.value || "—"}</span>
                    {location?.state && location.state.value && <FieldConfidenceBadge confidence={location.state.confidence} />}
                  </div>
                  {location?.state?.evidence && <FieldEvidenceQuote evidence={location.state.evidence} />}
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">District</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{location?.district?.value || "—"}</span>
                    {location?.district && location.district.value && <FieldConfidenceBadge confidence={location.district.confidence} />}
                  </div>
                  {location?.district?.evidence && <FieldEvidenceQuote evidence={location.district.evidence} />}
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Taluk / Tahsil</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{location?.taluk?.value || "—"}</span>
                    {location?.taluk && location.taluk.value && <FieldConfidenceBadge confidence={location.taluk.confidence} />}
                  </div>
                  {location?.taluk?.evidence && <FieldEvidenceQuote evidence={location.taluk.evidence} />}
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Village / Mauza</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{location?.village?.value || "—"}</span>
                    {location?.village && location.village.value && <FieldConfidenceBadge confidence={location.village.confidence} />}
                  </div>
                  {location?.village?.evidence && <FieldEvidenceQuote evidence={location.village.evidence} />}
                </div>

                {location?.hobli?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Hobli / Circle</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{location.hobli.value}</span>
                      <FieldConfidenceBadge confidence={location.hobli.confidence} />
                    </div>
                    {location.hobli.evidence && <FieldEvidenceQuote evidence={location.hobli.evidence} />}
                  </div>
                )}

                {location?.gramPanchayat?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Gram Panchayat</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{location.gramPanchayat.value}</span>
                      <FieldConfidenceBadge confidence={location.gramPanchayat.confidence} />
                    </div>
                    {location.gramPanchayat.evidence && <FieldEvidenceQuote evidence={location.gramPanchayat.evidence} />}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Parcel Identifiers */}
            <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
              <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
                <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={Layers01Icon} className="size-3.5 text-muted-foreground" />
                  <span>Parcel Identifiers</span>
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Survey Number</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{parcel?.surveyNumber?.value || "—"}</span>
                    {parcel?.surveyNumber && parcel.surveyNumber.value && <FieldConfidenceBadge confidence={parcel.surveyNumber.confidence} />}
                  </div>
                  {parcel?.surveyNumber?.evidence && <FieldEvidenceQuote evidence={parcel.surveyNumber.evidence} />}
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Hissa / Sub-Division</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{parcel?.subDivision?.value || "—"}</span>
                    {parcel?.subDivision && parcel.subDivision.value && <FieldConfidenceBadge confidence={parcel.subDivision.confidence} />}
                  </div>
                  {parcel?.subDivision?.evidence && <FieldEvidenceQuote evidence={parcel.subDivision.evidence} />}
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Khata Number</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{parcel?.khataNumber?.value || "—"}</span>
                    {parcel?.khataNumber && parcel.khataNumber.value && <FieldConfidenceBadge confidence={parcel.khataNumber.confidence} />}
                  </div>
                  {parcel?.khataNumber?.evidence && <FieldEvidenceQuote evidence={parcel.khataNumber.evidence} />}
                </div>

                {parcel?.plotNumber?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Plot Number</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{parcel.plotNumber.value}</span>
                      <FieldConfidenceBadge confidence={parcel.plotNumber.confidence} />
                    </div>
                    {parcel.plotNumber.evidence && <FieldEvidenceQuote evidence={parcel.plotNumber.evidence} />}
                  </div>
                )}

                {parcel?.pattaNumber?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Patta Number</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{parcel.pattaNumber.value}</span>
                      <FieldConfidenceBadge confidence={parcel.pattaNumber.confidence} />
                    </div>
                    {parcel.pattaNumber.evidence && <FieldEvidenceQuote evidence={parcel.pattaNumber.evidence} />}
                  </div>
                )}

                {parcel?.oldSurveyNumber?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Old Survey No.</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{parcel.oldSurveyNumber.value}</span>
                      <FieldConfidenceBadge confidence={parcel.oldSurveyNumber.confidence} />
                    </div>
                    {parcel.oldSurveyNumber.evidence && <FieldEvidenceQuote evidence={parcel.oldSurveyNumber.evidence} />}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Ownership & Khatedars */}
            <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
              <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
                <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} className="size-3.5 text-muted-foreground" />
                    <span>Ownership & Khatedars ({owners.length})</span>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2.5">
                {owners.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No owners explicitly detected in record.</p>
                ) : (
                  owners.map((owner, idx) => (
                    <div
                      key={idx}
                      className="rounded-md border border-border/70 bg-muted/15 p-2.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground text-sm">
                            {owner.name?.value || "Unknown Owner"}
                          </span>
                          {owner.relativeName?.value && (
                            <div className="text-muted-foreground text-[11px]">
                              {owner.relationshipType || "Relative"}: <span className="font-medium text-foreground">{owner.relativeName.value}</span>
                            </div>
                          )}
                        </div>
                        {owner.name && owner.name.value && <FieldConfidenceBadge confidence={owner.name.confidence} />}
                      </div>

                      {(owner.share?.value || owner.ownershipType || owner.idReference?.value) && (
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/40">
                          {owner.share?.value && (
                            <div>
                              <span className="text-muted-foreground">Share: </span>
                              <span className="font-medium text-foreground">{owner.share.value}</span>
                            </div>
                          )}
                          {owner.ownershipType && (
                            <div>
                              <span className="text-muted-foreground">Type: </span>
                              <span className="font-medium text-foreground">{owner.ownershipType}</span>
                            </div>
                          )}
                          {owner.idReference?.value && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">ID Ref: </span>
                              <span className="font-medium text-foreground">{owner.idReference.value}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {owner.name?.evidence && <FieldEvidenceQuote evidence={owner.name.evidence} />}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 4: Land Extent & Classification */}
            <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
              <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
                <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={Building01Icon} className="size-3.5 text-muted-foreground" />
                  <span>Land Extent & Classification</span>
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Total Extent</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {extent?.totalArea?.value ? `${extent.totalArea.value} ${extent.areaUnit?.value || ""}` : "—"}
                    </span>
                    {extent?.totalArea && extent.totalArea.value && <FieldConfidenceBadge confidence={extent.totalArea.confidence} />}
                  </div>
                  {extent?.totalArea?.evidence && <FieldEvidenceQuote evidence={extent.totalArea.evidence} />}
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Classification</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{extent?.landClassification?.value || "—"}</span>
                    {extent?.landClassification && extent.landClassification.value && (
                      <FieldConfidenceBadge confidence={extent.landClassification.confidence} />
                    )}
                  </div>
                  {extent?.landClassification?.evidence && (
                    <FieldEvidenceQuote evidence={extent.landClassification.evidence} />
                  )}
                </div>

                {extent?.cultivatedArea?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Cultivated Area</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{extent.cultivatedArea.value}</span>
                      <FieldConfidenceBadge confidence={extent.cultivatedArea.confidence} />
                    </div>
                  </div>
                )}

                {extent?.uncultivatedArea?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Uncultivated / Pot Kharab</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{extent.uncultivatedArea.value}</span>
                      <FieldConfidenceBadge confidence={extent.uncultivatedArea.confidence} />
                    </div>
                  </div>
                )}

                {extent?.landRevenueTax?.value && (
                  <div className="space-y-0.5 col-span-full">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Land Revenue / Tax Assessment</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{extent.landRevenueTax.value}</span>
                      <FieldConfidenceBadge confidence={extent.landRevenueTax.confidence} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Mutation & Registration Information */}
            <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
              <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
                <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={CodeIcon} className="size-3.5 text-muted-foreground" />
                  <span>Mutation & Title History</span>
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Mutation No.</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{mutation?.mutationNumber?.value || "—"}</span>
                    {mutation?.mutationNumber && mutation.mutationNumber.value && (
                      <FieldConfidenceBadge confidence={mutation.mutationNumber.confidence} />
                    )}
                  </div>
                  {mutation?.mutationNumber?.evidence && (
                    <FieldEvidenceQuote evidence={mutation.mutationNumber.evidence} />
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Mutation Type / Nature</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{mutation?.mutationType?.value || "—"}</span>
                    {mutation?.mutationType && mutation.mutationType.value && (
                      <FieldConfidenceBadge confidence={mutation.mutationType.confidence} />
                    )}
                  </div>
                  {mutation?.mutationType?.evidence && (
                    <FieldEvidenceQuote evidence={mutation.mutationType.evidence} />
                  )}
                </div>

                {mutation?.mutationDate?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Mutation Date</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{mutation.mutationDate.value}</span>
                      <FieldConfidenceBadge confidence={mutation.mutationDate.confidence} />
                    </div>
                  </div>
                )}

                {registration?.deedNumber?.value && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Deed / Registration No.</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{registration.deedNumber.value}</span>
                      <FieldConfidenceBadge confidence={registration.deedNumber.confidence} />
                    </div>
                    {registration.deedNumber.evidence && (
                      <FieldEvidenceQuote evidence={registration.deedNumber.evidence} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 6: Liabilities & Encumbrances (if any) */}
            {liabilities.length > 0 && (
              <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
                <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
                  <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <HugeiconsIcon icon={Alert02Icon} className="size-3.5" />
                    <span>Liabilities & Encumbrances ({liabilities.length})</span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {liabilities.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-md border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-foreground">
                          {item.description}
                        </span>
                        <FieldConfidenceBadge confidence={item.confidence} />
                      </div>
                      {item.institution && (
                        <div className="text-muted-foreground text-[11px]">
                          Institution: {item.institution}
                        </div>
                      )}
                      {item.amount && (
                        <div className="text-[11px] font-medium text-foreground">
                          Amount: {item.amount}
                        </div>
                      )}
                      <FieldEvidenceQuote evidence={item.evidence} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 7: Remarks */}
            {remarks.length > 0 && (
              <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
                <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">Remarks</span>
                <ul className="list-disc list-inside text-foreground/90 space-y-0.5">
                  {remarks.map((rem, i) => (
                    <li key={i}>{rem}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
