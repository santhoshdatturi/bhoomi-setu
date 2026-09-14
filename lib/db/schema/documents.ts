import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { documentTypeEnum, documentStatusEnum } from "./enums";
import { files } from "./files";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fileId: uuid("file_id")
      .references(() => files.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    fileName: text("file_name").notNull(),
    documentType: documentTypeEnum("document_type").notNull(),
    status: documentStatusEnum("status").default("uploaded").notNull(),
    state: text("state"),
    uploadedBy: text("uploaded_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_documents_status").on(table.status),
    index("idx_documents_uploaded_by").on(table.uploadedBy),
    index("idx_documents_file_id").on(table.fileId),
    index("idx_documents_created_at").on(table.createdAt),
  ]
);

export const documentsRelations = relations(documents, ({ one }) => ({
  file: one(files, {
    fields: [documents.fileId],
    references: [files.id],
  }),
}));
