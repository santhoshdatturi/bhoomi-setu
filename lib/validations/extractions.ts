import { createInsertSchema } from "drizzle-zod";
import { extractions } from "@/lib/db/schema/extractions";
import { extractionStatusEnum, documentTypeEnum } from "@/lib/db/schema/enums";
import { z } from "zod";

// ── Strict structured Land Record Extraction Zod Schema ───────────────────

export const fieldWithEvidenceSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    value: valueSchema.nullable(),
    confidence: z.number(),
    evidence: z.string().default(""),
  });

export const documentClassificationExtractionSchema = z.object({
  documentType: z.enum(documentTypeEnum.enumValues).default("unknown"),
  state: z.string().nullable().default(null),
  detectedLanguage: z.string().nullable().default(null),
  documentTitle: z.string().nullable().default(null),
  confidence: z.number().default(0),
  evidence: z.string().default(""),
});

export const locationExtractionSchema = z.object({
  state: fieldWithEvidenceSchema(z.string()).optional(),
  district: fieldWithEvidenceSchema(z.string()).optional(),
  taluk: fieldWithEvidenceSchema(z.string()).optional(),
  hobli: fieldWithEvidenceSchema(z.string()).optional(),
  village: fieldWithEvidenceSchema(z.string()).optional(),
  gramPanchayat: fieldWithEvidenceSchema(z.string()).optional(),
});

export const parcelIdentifiersExtractionSchema = z.object({
  surveyNumber: fieldWithEvidenceSchema(z.string()).optional(),
  subDivision: fieldWithEvidenceSchema(z.string()).optional(),
  khataNumber: fieldWithEvidenceSchema(z.string()).optional(),
  plotNumber: fieldWithEvidenceSchema(z.string()).optional(),
  pattaNumber: fieldWithEvidenceSchema(z.string()).optional(),
  oldSurveyNumber: fieldWithEvidenceSchema(z.string()).optional(),
});

export const ownerExtractionItemSchema = z.object({
  name: fieldWithEvidenceSchema(z.string()),
  relationshipType: z.string().nullable().optional(),
  relativeName: fieldWithEvidenceSchema(z.string()).optional(),
  share: fieldWithEvidenceSchema(z.string()).optional(),
  ownershipType: z.string().nullable().optional(),
  idReference: fieldWithEvidenceSchema(z.string()).optional(),
});

export const extentExtractionSchema = z.object({
  totalArea: fieldWithEvidenceSchema(z.string()).optional(),
  areaUnit: fieldWithEvidenceSchema(z.string()).optional(),
  cultivatedArea: fieldWithEvidenceSchema(z.string()).optional(),
  uncultivatedArea: fieldWithEvidenceSchema(z.string()).optional(),
  landClassification: fieldWithEvidenceSchema(z.string()).optional(),
  landRevenueTax: fieldWithEvidenceSchema(z.string()).optional(),
});

export const mutationExtractionSchema = z.object({
  mutationNumber: fieldWithEvidenceSchema(z.string()).optional(),
  mutationDate: fieldWithEvidenceSchema(z.string()).optional(),
  mutationType: fieldWithEvidenceSchema(z.string()).optional(),
  transferorOrPreviousOwner: fieldWithEvidenceSchema(z.string()).optional(),
  approvalAuthority: fieldWithEvidenceSchema(z.string()).optional(),
});

export const registrationExtractionSchema = z.object({
  deedNumber: fieldWithEvidenceSchema(z.string()).optional(),
  registrationDate: fieldWithEvidenceSchema(z.string()).optional(),
  sroOffice: fieldWithEvidenceSchema(z.string()).optional(),
  bookNumber: fieldWithEvidenceSchema(z.string()).optional(),
});

export const liabilityExtractionItemSchema = z.object({
  description: z.string(),
  institution: z.string().nullable().optional(),
  amount: z.string().nullable().optional(),
  confidence: z.number().default(0),
  evidence: z.string().default(""),
});

export const structuredLandRecordExtractionSchema = z.object({
  documentClassification: documentClassificationExtractionSchema,
  location: locationExtractionSchema.default({}),
  parcelIdentifiers: parcelIdentifiersExtractionSchema.default({}),
  owners: z.array(ownerExtractionItemSchema).default([]),
  extent: extentExtractionSchema.default({}),
  mutationInformation: mutationExtractionSchema.default({}),
  registrationInformation: registrationExtractionSchema.default({}),
  liabilities: z.array(liabilityExtractionItemSchema).default([]),
  remarks: z.array(z.string()).default([]),
  overallConfidence: z.number().default(0),
});

export type StructuredLandRecordExtraction = z.infer<typeof structuredLandRecordExtractionSchema>;
export type DocumentClassificationExtraction = z.infer<typeof documentClassificationExtractionSchema>;
export type LocationExtraction = z.infer<typeof locationExtractionSchema>;
export type ParcelIdentifiersExtraction = z.infer<typeof parcelIdentifiersExtractionSchema>;
export type OwnerExtractionItem = z.infer<typeof ownerExtractionItemSchema>;
export type ExtentExtraction = z.infer<typeof extentExtractionSchema>;
export type MutationExtraction = z.infer<typeof mutationExtractionSchema>;
export type RegistrationExtraction = z.infer<typeof registrationExtractionSchema>;
export type LiabilityExtractionItem = z.infer<typeof liabilityExtractionItemSchema>;

// ── Base schema for extractions table derived directly from Drizzle ───────

export const insertExtractionSchema = createInsertSchema(extractions, {
  documentId: z.uuid("Invalid Document ID"),
  status: z.enum(extractionStatusEnum.enumValues).optional(),
  confidenceScore: z.number().int().optional().nullable(),
  documentClassification: documentClassificationExtractionSchema.optional().nullable(),
  location: locationExtractionSchema.optional().nullable(),
  parcelIdentifiers: parcelIdentifiersExtractionSchema.optional().nullable(),
  owners: z.array(ownerExtractionItemSchema).optional().nullable(),
  extent: extentExtractionSchema.optional().nullable(),
  mutationInformation: mutationExtractionSchema.optional().nullable(),
  registrationInformation: registrationExtractionSchema.optional().nullable(),
  liabilities: z.array(liabilityExtractionItemSchema).optional().nullable(),
  remarks: z.array(z.string()).optional().nullable(),
  errorMessage: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateExtractionSchema = insertExtractionSchema.partial();
