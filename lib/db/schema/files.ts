import { pgTable, text, timestamp, uuid, integer, index } from "drizzle-orm/pg-core";
import { fileBucketEnum, fileStatusEnum } from "./enums";

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    bucket: fileBucketEnum("bucket").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    status: fileStatusEnum("status").notNull(),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_files_created_by").on(table.createdBy),
    index("idx_files_cleanup_status").on(table.status, table.createdAt),
    index("idx_files_bucket").on(table.bucket),
  ]
);
