import { pgTable, text, timestamp, uuid, integer, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { extractionStatusEnum } from "./enums";
import { documents } from "./documents";

export const extractions = pgTable(
  "extractions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .references(() => documents.id, { onDelete: "cascade" })
      .notNull(),
    status: extractionStatusEnum("status").default("pending").notNull(),
    confidenceScore: integer("confidence_score"),
    documentClassification: jsonb("document_classification"),
    location: jsonb("location"),
    parcelIdentifiers: jsonb("parcel_identifiers"),
    owners: jsonb("owners"),
    extent: jsonb("extent"),
    mutationInformation: jsonb("mutation_information"),
    registrationInformation: jsonb("registration_information"),
    liabilities: jsonb("liabilities"),
    remarks: jsonb("remarks"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_extractions_doc_id").on(table.documentId),
    index("idx_extractions_status").on(table.status),
    index("idx_extractions_created_at").on(table.createdAt),
  ]
);

export const extractionsRelations = relations(extractions, ({ one }) => ({
  document: one(documents, {
    fields: [extractions.documentId],
    references: [documents.id],
  }),
}));
