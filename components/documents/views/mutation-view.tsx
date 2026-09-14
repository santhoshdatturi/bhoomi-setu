"use client";

import {
  CodeIcon,
  Location01Icon,
  UserIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FieldConfidenceBadge } from "../field-confidence-badge";
import { FieldEvidenceQuote } from "../field-evidence-quote";
import type { StructuredLandRecordExtraction } from "@/lib/validations/extractions";

interface MutationViewProps {
  data: StructuredLandRecordExtraction | null;
}

export function MutationView({ data }: MutationViewProps) {
  if (!data) return null;

  const mutation = data.mutationInformation;
  const registration = data.registrationInformation;
  const location = data.location;
  const parcel = data.parcelIdentifiers;
  const extent = data.extent;
  const remarks = data.remarks || [];

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Mutation Order Header */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="py-2 px-3 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={CodeIcon} className="size-3.5 text-muted-foreground" />
            <span>Mutation Order & Transfer of Title</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
            Revenue Order
          </span>
        </div>

        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Mutation No</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground font-mono">{mutation?.mutationNumber?.value || "—"}</span>
              {mutation?.mutationNumber && mutation.mutationNumber.value && (
                <FieldConfidenceBadge confidence={mutation.mutationNumber.confidence} />
              )}
            </div>
            {mutation?.mutationNumber?.evidence && <FieldEvidenceQuote evidence={mutation.mutationNumber.evidence} />}
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Mutation Date</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{mutation?.mutationDate?.value || "—"}</span>
              {mutation?.mutationDate && mutation.mutationDate.value && (
                <FieldConfidenceBadge confidence={mutation.mutationDate.confidence} />
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Nature / Type</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{mutation?.mutationType?.value || "—"}</span>
              {mutation?.mutationType && mutation.mutationType.value && (
                <FieldConfidenceBadge confidence={mutation.mutationType.confidence} />
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Approval Authority</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{mutation?.approvalAuthority?.value || "Tahsildar"}</span>
              {mutation?.approvalAuthority && mutation.approvalAuthority.value && (
                <FieldConfidenceBadge confidence={mutation.approvalAuthority.confidence} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Transfer Parties (Previous Owner vs New Owner) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Transferor */}
        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground pb-1 border-b border-border/60">
            <HugeiconsIcon icon={UserIcon} className="size-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Transferor (Previous Owner)</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">
                {mutation?.transferorOrPreviousOwner?.value || "—"}
              </span>
              {mutation?.transferorOrPreviousOwner && mutation.transferorOrPreviousOwner.value && (
                <FieldConfidenceBadge confidence={mutation.transferorOrPreviousOwner.confidence} />
              )}
            </div>
            {mutation?.transferorOrPreviousOwner?.evidence && (
              <FieldEvidenceQuote evidence={mutation.transferorOrPreviousOwner.evidence} />
            )}
          </div>
        </div>

        {/* Transferee */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 shadow-2xs space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 pb-1 border-b border-emerald-500/20">
            <HugeiconsIcon icon={UserIcon} className="size-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Transferee (New Owner)</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">
                {data.owners?.[0]?.name || "—"}
              </span>
              {data.owners?.[0] && data.owners[0].confidence > 0 && (
                <FieldConfidenceBadge confidence={data.owners[0].confidence} />
              )}
            </div>
            {data.owners?.[0]?.relativeName && (
              <div className="text-muted-foreground text-[11px]">
                {data.owners[0].relationshipType || "Relative"}: <span className="font-medium text-foreground">{data.owners[0].relativeName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Affected Parcel & Jurisdiction */}
      <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs text-xs space-y-2">
        <div className="flex items-center gap-2 pb-1.5 border-b border-border/60 font-semibold text-foreground">
          <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-muted-foreground" />
          <span>Affected Parcel & Land Extent</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Location</span>
            <div className="font-medium text-foreground">
              {location?.village?.value || "—"}, {location?.district?.value || "—"}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Survey / Plot</span>
            <div className="font-mono font-medium text-foreground">
              {parcel?.surveyNumber?.value || parcel?.plotNumber?.value || "—"}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Transferred Area</span>
            <div className="font-semibold text-foreground">
              {extent?.totalArea?.value ? `${extent.totalArea.value} ${extent.areaUnit?.value || ""}` : "—"}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-medium">Registration Deed Ref</span>
            <div className="font-mono text-foreground">
              {registration?.deedNumber?.value || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Remarks */}
      {remarks.length > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1">
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Order Notes</span>
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
