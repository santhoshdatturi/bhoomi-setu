import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { stateEnum } from "./enums";

// ── 1. Parcels (Cadastral) ─────────────────────────────────────────────
export const parcels = pgTable(
  "parcels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    state: stateEnum("state").notNull(),
    district: varchar("district", { length: 100 }).notNull(),
    subDistrict: varchar("sub_district", { length: 100 }),
    village: varchar("village", { length: 100 }).notNull(),
    locality: varchar("locality", { length: 100 }),
    parcelIdType: varchar("parcel_id_type", { length: 50 }).notNull(),
    parcelId: varchar("parcel_id", { length: 50 }).notNull(),
    subdivision: varchar("subdivision", { length: 20 }),
    area: numeric("area", { precision: 10, scale: 2 }).notNull(),
    areaUnit: varchar("area_unit", { length: 20 }).notNull(),
    landClassification: varchar("land_classification", { length: 50 }),
    landUse: varchar("land_use", { length: 50 }),
    mapSheetRef: varchar("map_sheet_ref", { length: 50 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_parcels_location").on(table.state, table.district, table.village),
    index("idx_parcels_parcel_id").on(table.parcelId),
    index("idx_parcels_created_at").on(table.createdAt),
  ]
);

// ── 2. Ownership (RoR) ─────────────────────────────────────────────────
export const ownerships = pgTable(
  "ownerships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parcelId: uuid("parcel_id")
      .references(() => parcels.id, { onDelete: "cascade" })
      .notNull(),
    ownerName: varchar("owner_name", { length: 100 }).notNull(),
    ownerRelation: varchar("owner_relation", { length: 100 }),
    ownerType: varchar("owner_type", { length: 20 }),
    ownershipShare: numeric("ownership_share", { precision: 5, scale: 2 }),
    khataNumber: varchar("khata_number", { length: 20 }),
    accountNumber: varchar("account_number", { length: 20 }),
    rights: text("rights"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ownerships_parcel_id").on(table.parcelId),
    index("idx_ownerships_khata_no").on(table.khataNumber),
    index("idx_ownerships_owner_name").on(table.ownerName),
  ]
);

// ── 3. Cultivation (Adangal / Pahani) ──────────────────────────────────
export const cultivations = pgTable(
  "cultivations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parcelId: uuid("parcel_id")
      .references(() => parcels.id, { onDelete: "cascade" })
      .notNull(),
    cultivatorName: varchar("cultivator_name", { length: 100 }),
    tenantType: varchar("tenant_type", { length: 50 }),
    landUseDetail: varchar("land_use_detail", { length: 50 }),
    crop: varchar("crop", { length: 50 }),
    irrigationSource: varchar("irrigation_source", { length: 50 }),
    soilType: varchar("soil_type", { length: 50 }),
    totalExtent: numeric("total_extent", { precision: 10, scale: 2 }),
    totalExtentUnit: varchar("total_extent_unit", { length: 20 }),
    grossExtent: numeric("gross_extent", { precision: 10, scale: 2 }),
    grossExtentUnit: varchar("gross_extent_unit", { length: 20 }),
    harvestArea: numeric("harvest_area", { precision: 10, scale: 2 }),
    harvestUnit: varchar("harvest_unit", { length: 20 }),
    dateRecorded: date("date_recorded"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cultivations_parcel_id").on(table.parcelId),
    index("idx_cultivations_crop").on(table.crop),
  ]
);

// ── 4. Mutation (Transfer) ─────────────────────────────────────────────
export const mutations = pgTable(
  "mutations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parcelId: uuid("parcel_id").references(() => parcels.id, {
      onDelete: "set null",
    }),
    mutationNo: varchar("mutation_no", { length: 20 }).notNull(),
    mutationDate: date("mutation_date").notNull(),
    mutationType: varchar("mutation_type", { length: 50 }),
    previousOwner: varchar("previous_owner", { length: 100 }),
    newOwner: varchar("new_owner", { length: 100 }).notNull(),
    details: text("details"),
    status: varchar("status", { length: 20 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_mutations_parcel_id").on(table.parcelId),
    index("idx_mutations_mutation_no").on(table.mutationNo),
    index("idx_mutations_date").on(table.mutationDate),
  ]
);

// ── 5. Account / Holding (Khata / 8A) ──────────────────────────────────
export const accountHoldings = pgTable(
  "account_holdings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    state: stateEnum("state").notNull(),
    accountNumber: varchar("account_number", { length: 20 }).notNull(),
    ownerName: varchar("owner_name", { length: 100 }).notNull(),
    relationName: varchar("relation_name", { length: 100 }),
    totalArea: numeric("total_area", { precision: 10, scale: 2 }),
    totalAreaUnit: varchar("total_area_unit", { length: 20 }),
    landTypeSummary: varchar("land_type_summary", { length: 50 }),
    taxAssessment: numeric("tax_assessment", { precision: 12, scale: 2 }),
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_acc_holdings_state_num").on(table.state, table.accountNumber),
    index("idx_acc_holdings_owner").on(table.ownerName),
  ]
);

// ── 6. Encumbrance ─────────────────────────────────────────────────────
export const encumbrances = pgTable(
  "encumbrances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parcelId: uuid("parcel_id").references(() => parcels.id, {
      onDelete: "cascade",
    }),
    accountId: uuid("account_id").references(() => accountHoldings.id, {
      onDelete: "cascade",
    }),
    encumbranceType: varchar("encumbrance_type", { length: 50 }).notNull(),
    institution: varchar("institution", { length: 100 }),
    amount: numeric("amount", { precision: 12, scale: 2 }),
    encumbranceDate: date("encumbrance_date"),
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_encumbrances_parcel_id").on(table.parcelId),
    index("idx_encumbrances_account_id").on(table.accountId),
    index("idx_encumbrances_type").on(table.encumbranceType),
  ]
);

// ── 7. Spatial / Cadastral Map ─────────────────────────────────────────
export const spatialMaps = pgTable(
  "spatial_maps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parcelId: uuid("parcel_id")
      .references(() => parcels.id, { onDelete: "cascade" })
      .notNull(),
    geometry: text("geometry"),
    mapSheet: varchar("map_sheet", { length: 50 }),
    surveyCode: varchar("survey_code", { length: 20 }),
    createdDate: date("created_date"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [index("idx_spatial_maps_parcel_id").on(table.parcelId)]
);

// ── 8. Property Card (Urban) ───────────────────────────────────────────
export const propertyCards = pgTable(
  "property_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: varchar("property_id", { length: 50 }).notNull(),
    ownerName: varchar("owner_name", { length: 100 }).notNull(),
    ownerRelation: varchar("owner_relation", { length: 100 }),
    usage: varchar("usage", { length: 50 }),
    area: numeric("area", { precision: 10, scale: 2 }),
    areaUnit: varchar("area_unit", { length: 20 }),
    taxAssessment: numeric("tax_assessment", { precision: 12, scale: 2 }),
    encumbrances: text("encumbrances"),
    mutationHistory: text("mutation_history"),
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_prop_cards_prop_id").on(table.propertyId),
    index("idx_prop_cards_owner_name").on(table.ownerName),
  ]
);

// ── Relations ──────────────────────────────────────────────────────────
export const parcelsRelations = relations(parcels, ({ many }) => ({
  ownerships: many(ownerships),
  cultivations: many(cultivations),
  mutations: many(mutations),
  encumbrances: many(encumbrances),
  spatialMaps: many(spatialMaps),
}));

export const ownershipsRelations = relations(ownerships, ({ one }) => ({
  parcel: one(parcels, {
    fields: [ownerships.parcelId],
    references: [parcels.id],
  }),
}));

export const cultivationsRelations = relations(cultivations, ({ one }) => ({
  parcel: one(parcels, {
    fields: [cultivations.parcelId],
    references: [parcels.id],
  }),
}));

export const mutationsRelations = relations(mutations, ({ one }) => ({
  parcel: one(parcels, {
    fields: [mutations.parcelId],
    references: [parcels.id],
  }),
}));

export const accountHoldingsRelations = relations(
  accountHoldings,
  ({ many }) => ({
    encumbrances: many(encumbrances),
  })
);

export const encumbrancesRelations = relations(encumbrances, ({ one }) => ({
  parcel: one(parcels, {
    fields: [encumbrances.parcelId],
    references: [parcels.id],
  }),
  accountHolding: one(accountHoldings, {
    fields: [encumbrances.accountId],
    references: [accountHoldings.id],
  }),
}));

export const spatialMapsRelations = relations(spatialMaps, ({ one }) => ({
  parcel: one(parcels, {
    fields: [spatialMaps.parcelId],
    references: [parcels.id],
  }),
}));
