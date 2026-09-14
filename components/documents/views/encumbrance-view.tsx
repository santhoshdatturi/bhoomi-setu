"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface EncumbranceViewProps {
  data: StructuredLandRecordExtraction | null;
}

export function EncumbranceView({ data }: EncumbranceViewProps) {
  if (!data) return null;

  const liabilities = data.liabilities || [];
  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const registration = data.registrationInformation;
  const remarks = data.remarks || [];

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Header */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <HugeiconsIcon icon={Alert02Icon} className="size-3.5" />
            <span>Encumbrance Certificate & Charges</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-medium">
            {liabilities.length} Active {liabilities.length === 1 ? "Entry" : "Entries"}
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
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Survey / Plot</span>
            <span className="font-semibold font-mono text-foreground">{parcel?.surveyNumber?.value || parcel?.plotNumber?.value || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider block">Deed No</span>
            <span className="font-semibold font-mono text-foreground">{registration?.deedNumber?.value || "—"}</span>
          </div>
        </div>
      </div>

      {/* 2. Liabilities List */}
      <div className="space-y-2">
        {liabilities.length === 0 ? (
          <div className="rounded-lg border border-border/80 bg-card p-6 text-center text-xs text-muted-foreground">
            No registered encumbrances or mortgage liabilities found in this document (Nil Encumbrance Certificate).
          </div>
        ) : (
          liabilities.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs space-y-2 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-foreground text-sm block">{item.description}</span>
                  {item.institution && (
                    <div className="text-muted-foreground text-[11px]">
                      Lending Institution / Branch: <span className="font-medium text-foreground">{item.institution}</span>
                    </div>
                  )}
                </div>
                <FieldConfidenceBadge confidence={item.confidence} />
              </div>

              {item.amount && (
                <div className="flex items-center gap-1.5 pt-1 border-t border-rose-500/20">
                  <span className="text-muted-foreground text-[11px]">Encumbered Amount:</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">{item.amount}</span>
                </div>
              )}

              {item.evidence && <FieldEvidenceQuote evidence={item.evidence} />}
            </div>
          ))
        )}
      </div>

      {/* 3. Remarks */}
      {remarks.length > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">EC Remarks</span>
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
