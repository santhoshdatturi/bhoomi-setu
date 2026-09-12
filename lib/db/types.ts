import type {
  profiles,
  files,
  documents,
  extractions,
} from "./schema";

// ── Row types (SELECT) ─────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect;
export type FileRecord = typeof files.$inferSelect;
export type DocumentRecord = typeof documents.$inferSelect;
export type ExtractionRecord = typeof extractions.$inferSelect;

// ── Column-level utility types ─────────────────────────────────────────
export type FileBucket = typeof files.$inferInsert["bucket"];
export type FileStatus = typeof files.$inferInsert["status"];
export type UserRole = typeof profiles.$inferInsert["role"];
export type DocumentType = typeof documents.$inferInsert["documentType"];
export type DocumentStatus = typeof documents.$inferInsert["status"];
export type ExtractionStatus = typeof extractions.$inferInsert["status"];
