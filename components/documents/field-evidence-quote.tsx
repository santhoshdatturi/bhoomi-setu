"use client";

import { cn } from "@/lib/utils";

interface FieldEvidenceQuoteProps {
  evidence?: string | null;
  className?: string;
}

export function FieldEvidenceQuote({ evidence, className }: FieldEvidenceQuoteProps) {
  if (!evidence || evidence.trim().length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "text-[11px] text-muted-foreground/80 leading-normal line-clamp-2 pt-0.5 select-text",
        className
      )}
      title={`Source quote: ${evidence}`}
    >
      <span className="font-normal text-muted-foreground/50 mr-1">Source:</span>
      <span className="italic font-sans">&ldquo;{evidence}&rdquo;</span>
    </div>
  );
}
