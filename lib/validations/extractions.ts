import { documentTypeEnum } from "@/lib/db/schema/enums";
import { z } from "zod";

// ── Strict structured Land Record Extraction Zod Schema ───────────────────

export const stringFieldWithEvidenceSchema = z.object({
  value: z.string().default(""),
  confidence: z.number().default(0),
  evidence: z.string().default(""),
});

export const fieldWithEvidenceSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    value: valueSchema.optional(),
    confidence: z.number().default(0),
    evidence: z.string().default(""),
  });

export const jurisdictionCheckSchema = z.object({
  isMismatch: z.boolean().default(false),
  expectedState: z.string().default(""),
  actualDetectedState: z.string().default(""),
  detectedDistrict: z.string().default(""),
  reason: z.string().default(""),
});

export const documentClassificationExtractionSchema = z.object({
  documentType: z.enum(documentTypeEnum.enumValues),
  state: z.string().default(""),
  detectedLanguage: z.string().default(""),
  documentTitle: z.string().default(""),
  confidence: z.number().default(0),
  evidence: z.string().default(""),
  jurisdictionCheck: jurisdictionCheckSchema.optional(),
});

export const locationExtractionSchema = z.object({
  state: stringFieldWithEvidenceSchema.optional(),
  district: stringFieldWithEvidenceSchema.optional(),
  taluk: stringFieldWithEvidenceSchema.optional(),
  hobli: stringFieldWithEvidenceSchema.optional(),
  village: stringFieldWithEvidenceSchema.optional(),
  gramPanchayat: stringFieldWithEvidenceSchema.optional(),
});

export const parcelIdentifiersExtractionSchema = z.object({
  surveyNumber: stringFieldWithEvidenceSchema.optional(),
  subDivision: stringFieldWithEvidenceSchema.optional(),
  khataNumber: stringFieldWithEvidenceSchema.optional(),
  plotNumber: stringFieldWithEvidenceSchema.optional(),
  pattaNumber: stringFieldWithEvidenceSchema.optional(),
  oldSurveyNumber: stringFieldWithEvidenceSchema.optional(),
});

export const ownerExtractionItemSchema = z.object({
  surveyNumber: z.string().default(""),
  subDivision: z.string().default(""),
  khataNumber: z.string().default(""),
  name: z.string().default(""),
  relationshipType: z.string().default(""),
  relativeName: z.string().default(""),
  share: z.string().default(""),
  ownershipType: z.string().default(""),
  idReference: z.string().default(""),
  confidence: z.number().default(0),
  evidence: z.string().default(""),
});

export const parcelRecordItemSchema = z.object({
  surveyNumber: z.string().default(""),
  subDivision: z.string().default(""),
  plotNumber: z.string().default(""),
  khataNumber: z.string().default(""),
  ownerName: z.string().default(""),
  relativeName: z.string().default(""),
  relationshipType: z.string().default(""),
  address: z.string().default(""),
  area: z.string().default(""),
  areaUnit: z.string().default(""),
  natureOfPossession: z.string().default(""),
  landClassification: z.string().default(""),
  remarksOrEncumbrances: z.string().default(""),
  share: z.string().default(""),
  confidence: z.number().default(0),
  evidence: z.string().default(""),
});

export const extentExtractionSchema = z.object({
  totalArea: stringFieldWithEvidenceSchema.optional(),
  areaUnit: stringFieldWithEvidenceSchema.optional(),
  cultivatedArea: stringFieldWithEvidenceSchema.optional(),
  uncultivatedArea: stringFieldWithEvidenceSchema.optional(),
  landClassification: stringFieldWithEvidenceSchema.optional(),
  landRevenueTax: stringFieldWithEvidenceSchema.optional(),
});

export const mutationExtractionSchema = z.object({
  mutationNumber: stringFieldWithEvidenceSchema.optional(),
  mutationDate: stringFieldWithEvidenceSchema.optional(),
  mutationType: stringFieldWithEvidenceSchema.optional(),
  transferorOrPreviousOwner: stringFieldWithEvidenceSchema.optional(),
  approvalAuthority: stringFieldWithEvidenceSchema.optional(),
});

export const registrationExtractionSchema = z.object({
  deedNumber: stringFieldWithEvidenceSchema.optional(),
  registrationDate: stringFieldWithEvidenceSchema.optional(),
  sroOffice: stringFieldWithEvidenceSchema.optional(),
  bookNumber: stringFieldWithEvidenceSchema.optional(),
});

export const liabilityExtractionItemSchema = z.object({
  description: z.string().default(""),
  institution: z.string().default(""),
  amount: z.string().default(""),
  confidence: z.number().default(0),
  evidence: z.string().default(""),
});

export const structuredLandRecordExtractionSchema = z.object({
  documentClassification: documentClassificationExtractionSchema,
  location: locationExtractionSchema.default({}),
  parcelIdentifiers: parcelIdentifiersExtractionSchema.default({}),
  owners: z.array(ownerExtractionItemSchema).default([]),
  records: z.array(parcelRecordItemSchema).default([]),
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
export type ParcelRecordItem = z.infer<typeof parcelRecordItemSchema>;
export type ExtentExtraction = z.infer<typeof extentExtractionSchema>;
export type MutationExtraction = z.infer<typeof mutationExtractionSchema>;
export type RegistrationExtraction = z.infer<typeof registrationExtractionSchema>;
export type LiabilityExtractionItem = z.infer<typeof liabilityExtractionItemSchema>;
