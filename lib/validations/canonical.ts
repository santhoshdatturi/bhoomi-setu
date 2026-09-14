import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import {
  parcels,
  ownerships,
  cultivations,
  mutations,
  accountHoldings,
  encumbrances,
  spatialMaps,
  propertyCards,
} from "@/lib/db/schema/canonical";
import { stateEnum } from "@/lib/db/schema/enums";

// ── 1. Parcels Validation Schemas ──────────────────────────────────────────
export const insertParcelSchema = createInsertSchema(parcels, {
  state: z.enum(stateEnum.enumValues),
  district: z.string().min(1, "District is required").max(100),
  subDistrict: z.string().max(100).optional().nullable(),
  village: z.string().min(1, "Village is required").max(100),
  locality: z.string().max(100).optional().nullable(),
  parcelIdType: z.string().min(1, "Parcel ID type is required").max(50),
  parcelId: z.string().min(1, "Parcel ID is required").max(50),
  subdivision: z.string().max(20).optional().nullable(),
  area: z.string().min(1, "Area is required"),
  areaUnit: z.string().min(1, "Area unit is required").max(20),
  landClassification: z.string().max(50).optional().nullable(),
  landUse: z.string().max(50).optional().nullable(),
  mapSheetRef: z.string().max(50).optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateParcelSchema = insertParcelSchema.partial();

export const parcelFilterSchema = z.object({
  state: z.enum(stateEnum.enumValues).optional(),
  district: z.string().max(100).optional(),
  village: z.string().max(100).optional(),
  parcelId: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── 2. Ownerships Validation Schemas ───────────────────────────────────────
export const insertOwnershipSchema = createInsertSchema(ownerships, {
  parcelId: z.uuid("Invalid Parcel ID"),
  ownerName: z.string().min(1, "Owner name is required").max(100),
  ownerRelation: z.string().max(100).optional().nullable(),
  ownerType: z.string().max(20).optional().nullable(),
  ownershipShare: z.string().optional().nullable(),
  khataNumber: z.string().max(20).optional().nullable(),
  accountNumber: z.string().max(20).optional().nullable(),
  rights: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOwnershipSchema = insertOwnershipSchema.partial();

export const ownershipFilterSchema = z.object({
  parcelId: z.uuid("Invalid Parcel ID").optional(),
  khataNumber: z.string().max(20).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── 3. Cultivations Validation Schemas ─────────────────────────────────────
export const insertCultivationSchema = createInsertSchema(cultivations, {
  parcelId: z.uuid("Invalid Parcel ID"),
  cultivatorName: z.string().max(100).optional().nullable(),
  tenantType: z.string().max(50).optional().nullable(),
  landUseDetail: z.string().max(50).optional().nullable(),
  crop: z.string().max(50).optional().nullable(),
  irrigationSource: z.string().max(50).optional().nullable(),
  soilType: z.string().max(50).optional().nullable(),
  totalExtent: z.string().optional().nullable(),
  totalExtentUnit: z.string().max(20).optional().nullable(),
  grossExtent: z.string().optional().nullable(),
  grossExtentUnit: z.string().max(20).optional().nullable(),
  harvestArea: z.string().optional().nullable(),
  harvestUnit: z.string().max(20).optional().nullable(),
  dateRecorded: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCultivationSchema = insertCultivationSchema.partial();

export const cultivationFilterSchema = z.object({
  parcelId: z.uuid("Invalid Parcel ID").optional(),
  crop: z.string().max(50).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── 4. Mutations Validation Schemas ────────────────────────────────────────
export const insertMutationSchema = createInsertSchema(mutations, {
  parcelId: z.uuid("Invalid Parcel ID").optional().nullable(),
  mutationNo: z.string().min(1, "Mutation number is required").max(20),
  mutationDate: z.string().min(1, "Mutation date is required"),
  mutationType: z.string().max(50).optional().nullable(),
  previousOwner: z.string().max(100).optional().nullable(),
  newOwner: z.string().min(1, "New owner is required").max(100),
  details: z.string().optional().nullable(),
  status: z.string().max(20).optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMutationSchema = insertMutationSchema.partial();

export const mutationFilterSchema = z.object({
  parcelId: z.uuid("Invalid Parcel ID").optional(),
  mutationNo: z.string().max(20).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── 5. Account Holdings Validation Schemas ─────────────────────────────────
export const insertAccountHoldingSchema = createInsertSchema(accountHoldings, {
  state: z.enum(stateEnum.enumValues),
  accountNumber: z.string().min(1, "Account number is required").max(20),
  ownerName: z.string().min(1, "Owner name is required").max(100),
  relationName: z.string().max(100).optional().nullable(),
  totalArea: z.string().optional().nullable(),
  totalAreaUnit: z.string().max(20).optional().nullable(),
  landTypeSummary: z.string().max(50).optional().nullable(),
  taxAssessment: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAccountHoldingSchema = insertAccountHoldingSchema.partial();

export const accountHoldingFilterSchema = z.object({
  state: z.enum(stateEnum.enumValues).optional(),
  accountNumber: z.string().max(20).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── 6. Encumbrances Validation Schemas ─────────────────────────────────────
export const insertEncumbranceSchema = createInsertSchema(encumbrances, {
  parcelId: z.uuid("Invalid Parcel ID").optional().nullable(),
  accountId: z.uuid("Invalid Account ID").optional().nullable(),
  encumbranceType: z.string().min(1, "Encumbrance type is required").max(50),
  institution: z.string().max(100).optional().nullable(),
  amount: z.string().optional().nullable(),
  encumbranceDate: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEncumbranceSchema = insertEncumbranceSchema.partial();

export const encumbranceFilterSchema = z.object({
  parcelId: z.uuid("Invalid Parcel ID").optional(),
  accountId: z.uuid("Invalid Account ID").optional(),
  encumbranceType: z.string().max(50).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── 7. Spatial Maps Validation Schemas ─────────────────────────────────────
export const insertSpatialMapSchema = createInsertSchema(spatialMaps, {
  parcelId: z.uuid("Invalid Parcel ID"),
  geometry: z.string().optional().nullable(),
  mapSheet: z.string().max(50).optional().nullable(),
  surveyCode: z.string().max(20).optional().nullable(),
  createdDate: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSpatialMapSchema = insertSpatialMapSchema.partial();

export const spatialMapFilterSchema = z.object({
  parcelId: z.uuid("Invalid Parcel ID").optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── 8. Property Cards Validation Schemas ───────────────────────────────────
export const insertPropertyCardSchema = createInsertSchema(propertyCards, {
  propertyId: z.string().min(1, "Property ID is required").max(50),
  ownerName: z.string().min(1, "Owner name is required").max(100),
  ownerRelation: z.string().max(100).optional().nullable(),
  usage: z.string().max(50).optional().nullable(),
  area: z.string().optional().nullable(),
  areaUnit: z.string().max(20).optional().nullable(),
  taxAssessment: z.string().optional().nullable(),
  encumbrances: z.string().optional().nullable(),
  mutationHistory: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePropertyCardSchema = insertPropertyCardSchema.partial();

export const propertyCardFilterSchema = z.object({
  propertyId: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── Inferred Types ────────────────────────────────────────────────────────
export type InsertParcelInput = z.infer<typeof insertParcelSchema>;
export type UpdateParcelInput = z.infer<typeof updateParcelSchema>;
export type ParcelFilterInput = z.infer<typeof parcelFilterSchema>;

export type InsertOwnershipInput = z.infer<typeof insertOwnershipSchema>;
export type UpdateOwnershipInput = z.infer<typeof updateOwnershipSchema>;
export type OwnershipFilterInput = z.infer<typeof ownershipFilterSchema>;

export type InsertCultivationInput = z.infer<typeof insertCultivationSchema>;
export type UpdateCultivationInput = z.infer<typeof updateCultivationSchema>;
export type CultivationFilterInput = z.infer<typeof cultivationFilterSchema>;

export type InsertMutationInput = z.infer<typeof insertMutationSchema>;
export type UpdateMutationInput = z.infer<typeof updateMutationSchema>;
export type MutationFilterInput = z.infer<typeof mutationFilterSchema>;

export type InsertAccountHoldingInput = z.infer<typeof insertAccountHoldingSchema>;
export type UpdateAccountHoldingInput = z.infer<typeof updateAccountHoldingSchema>;
export type AccountHoldingFilterInput = z.infer<typeof accountHoldingFilterSchema>;

export type InsertEncumbranceInput = z.infer<typeof insertEncumbranceSchema>;
export type UpdateEncumbranceInput = z.infer<typeof updateEncumbranceSchema>;
export type EncumbranceFilterInput = z.infer<typeof encumbranceFilterSchema>;

export type InsertSpatialMapInput = z.infer<typeof insertSpatialMapSchema>;
export type UpdateSpatialMapInput = z.infer<typeof updateSpatialMapSchema>;
export type SpatialMapFilterInput = z.infer<typeof spatialMapFilterSchema>;

export type InsertPropertyCardInput = z.infer<typeof insertPropertyCardSchema>;
export type UpdatePropertyCardInput = z.infer<typeof updatePropertyCardSchema>;
export type PropertyCardFilterInput = z.infer<typeof propertyCardFilterSchema>;
