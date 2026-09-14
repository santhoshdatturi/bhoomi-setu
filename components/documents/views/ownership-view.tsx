"use client";

import { useState, Fragment } from "react";
import {
  Location01Icon,
  Layers01Icon,
  Building01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type {
  StructuredLandRecordExtraction,
  ParcelRecordItem,
} from "@/lib/validations/extractions";

interface OwnershipViewProps {
  data: StructuredLandRecordExtraction | null;
}

function hasValue(field?: { value?: string | null; confidence?: number }) {
  return Boolean(field?.value && field.value.trim().length > 0 && (field.confidence ?? 0) > 0);
}

export function OwnershipView({ data }: OwnershipViewProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  if (!data) return null;

  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const rawRecords = data.records || [];
  const owners = data.owners || [];
  const extent = data.extent;
  const liabilities = data.liabilities || [];
  const remarks = data.remarks || [];

  // Synthesize multi-row table items if records array is populated, or fallback to owners
  const rows: ParcelRecordItem[] =
    rawRecords.length > 0
      ? rawRecords
      : owners.map((owner) => ({
          surveyNumber: owner.surveyNumber || parcel?.surveyNumber?.value || "",
          subDivision: owner.subDivision || parcel?.subDivision?.value || "",
          plotNumber: parcel?.plotNumber?.value || "",
          khataNumber: owner.khataNumber || parcel?.khataNumber?.value || "",
          ownerName: owner.name,
          relativeName: owner.relativeName,
          relationshipType: owner.relationshipType,
          address: "",
          area: extent?.totalArea?.value || "",
          areaUnit: extent?.areaUnit?.value || "",
          natureOfPossession: owner.ownershipType || "",
          landClassification: extent?.landClassification?.value || "",
          remarksOrEncumbrances: "",
          share: owner.share,
          confidence: owner.confidence,
          evidence: owner.evidence,
        }));

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Header: Location & Jurisdiction */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
          <div className="text-xs font-semibold text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-muted-foreground" />
              <span>Location & Jurisdiction (RoR / Jamabandi)</span>
            </div>
            {parcel?.khataNumber?.value && (
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Khata No: {parcel.khataNumber.value}
              </span>
            )}
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
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Tehsil / Taluk</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{location?.taluk?.value || "—"}</span>
              {location?.taluk && location.taluk.value && <FieldConfidenceBadge confidence={location.taluk.confidence} />}
            </div>
            {location?.taluk?.evidence && <FieldEvidenceQuote evidence={location.taluk.evidence} />}
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Village / Mauza</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{location?.village?.value || "—"}</span>
              {location?.village && location.village.value && <FieldConfidenceBadge confidence={location.village.confidence} />}
            </div>
            {location?.village?.evidence && <FieldEvidenceQuote evidence={location.village.evidence} />}
          </div>
        </div>
      </div>

      {/* 2. Multi-Row RoR / Form P-II Cadastral Records Table */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Layers01Icon} className="size-3.5 text-muted-foreground" />
            <span>Record of Rights Entries ({rows.length} {rows.length === 1 ? "Record" : "Records"})</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">Form P-II Format</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-2 px-2.5 whitespace-nowrap">Plot / Survey No</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Khatedar / Owner</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Father / Husband</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Address</th>
                <th className="py-2 px-2.5 whitespace-nowrap text-right">Area (Ha)</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Possession</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Classification</th>
                <th className="py-2 px-2.5 whitespace-nowrap">Remarks / Encumbrances</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground italic">
                    No plot records detected in this document.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const plotDisplay =
                    row.plotNumber ||
                    (row.surveyNumber
                      ? `${row.surveyNumber}${row.subDivision ? `/${row.subDivision}` : ""}`
                      : "—");

                  return (
                    <Fragment key={idx}>
                      <tr className="hover:bg-muted/30 transition-colors">
                        {/* 1. Plot / Survey No */}
                        <td className="py-2 px-2.5 font-mono font-medium text-foreground whitespace-nowrap align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[11px]">
                              {plotDisplay}
                            </span>
                            {row.confidence > 0 && <FieldConfidenceBadge confidence={row.confidence} />}
                            {row.evidence && (
                              <button
                                type="button"
                                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                                className="text-[10px] font-sans px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border/50 transition-colors cursor-pointer"
                                title={`Source quote: "${row.evidence}" (click to expand)`}
                              >
                                {expandedRow === idx ? "Hide Source" : "Source"}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 2. Khatedar / Owner */}
                        <td className="py-2 px-2.5 font-semibold text-foreground whitespace-nowrap align-top">
                          <span>{row.ownerName || "—"}</span>
                        </td>

                        {/* 3. Father / Husband */}
                        <td className="py-2 px-2.5 text-muted-foreground whitespace-nowrap align-top">
                          <div className="flex items-center gap-1">
                            {row.relationshipType && (
                              <span className="text-[10px] text-muted-foreground/70">{row.relationshipType}</span>
                            )}
                            <span className="text-foreground">{row.relativeName || "—"}</span>
                          </div>
                        </td>

                        {/* 4. Address */}
                        <td className="py-2 px-2.5 text-muted-foreground whitespace-nowrap align-top">
                          <span>{row.address || location?.village?.value || "—"}</span>
                        </td>

                        {/* 5. Area */}
                        <td className="py-2 px-2.5 font-mono text-foreground text-right whitespace-nowrap align-top">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-semibold">{row.area || "—"}</span>
                            <span className="text-[10px] text-muted-foreground">{row.areaUnit || "Ha"}</span>
                          </div>
                        </td>

                        {/* 6. Possession */}
                        <td className="py-2 px-2.5 text-muted-foreground whitespace-nowrap align-top">
                          <span className="text-foreground">{row.natureOfPossession || "—"}</span>
                        </td>

                        {/* 7. Classification */}
                        <td className="py-2 px-2.5 whitespace-nowrap align-top">
                          {row.landClassification ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              {row.landClassification}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* 8. Remarks / Encumbrances */}
                        <td className="py-2 px-2.5 align-top">
                          {row.remarksOrEncumbrances && row.remarksOrEncumbrances !== "NIL" ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                              {row.remarksOrEncumbrances}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 text-[11px]">NIL</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable full-width row source quote spanning all columns */}
                      {expandedRow === idx && row.evidence && (
                        <tr className="bg-muted/15 border-b border-border/60">
                          <td colSpan={8} className="py-2 px-3 text-xs">
                            <div className="flex items-start gap-2 bg-background/80 p-2.5 rounded border border-border/60 text-foreground">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider shrink-0 mt-0.5">
                                Row Source:
                              </span>
                              <span className="text-[11px] font-mono text-muted-foreground italic leading-relaxed break-words select-text">
                                &ldquo;{row.evidence}&rdquo;
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Overall Extent Summary (only if available) */}
      {(hasValue(extent?.totalArea) || hasValue(extent?.cultivatedArea) || hasValue(extent?.landRevenueTax)) && (
        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border/60 text-xs font-semibold text-foreground">
            <HugeiconsIcon icon={Building01Icon} className="size-3.5 text-muted-foreground" />
            <span>Extent & Revenue Summary</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {hasValue(extent?.totalArea) && (
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Total Area</span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    {extent?.totalArea?.value} {extent?.areaUnit?.value || "Ha"}
                  </span>
                  {extent?.totalArea && <FieldConfidenceBadge confidence={extent.totalArea.confidence} />}
                </div>
              </div>
            )}

            {hasValue(extent?.cultivatedArea) && (
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Cultivated Area</span>
                <span className="font-semibold text-foreground">{extent?.cultivatedArea?.value}</span>
              </div>
            )}

            {hasValue(extent?.uncultivatedArea) && (
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Uncultivated</span>
                <span className="font-semibold text-foreground">{extent?.uncultivatedArea?.value}</span>
              </div>
            )}

            {hasValue(extent?.landRevenueTax) && (
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Revenue Tax</span>
                <span className="font-semibold text-foreground">{extent?.landRevenueTax?.value}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Liabilities & Encumbrances (if any) */}
      {liabilities.length > 0 && (
        <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
          <div className="py-2 px-3 bg-muted/25 border-b border-border/60">
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <HugeiconsIcon icon={Alert02Icon} className="size-3.5" />
              <span>Liabilities & Encumbrances ({liabilities.length})</span>
            </div>
          </div>
          <div className="p-3 space-y-2 text-xs">
            {liabilities.map((item, idx) => (
              <div key={idx} className="rounded-md border border-rose-500/20 bg-rose-500/5 p-2.5 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-semibold text-foreground">{item.description}</span>
                  <FieldConfidenceBadge confidence={item.confidence} />
                </div>
                {item.institution && <div className="text-muted-foreground text-[11px]">Bank: {item.institution}</div>}
                {item.amount && <div className="text-[11px] font-medium text-foreground">Amount: {item.amount}</div>}
                <FieldEvidenceQuote evidence={item.evidence} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Remarks */}
      {remarks.length > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Remarks</span>
          <ul className="list-disc list-inside text-foreground/90 space-y-0.5 text-xs">
            {remarks.map((rem, i) => (
              <li key={i}>{rem}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
