import type {
  files,
  documents,
  extractions,
  users,
  sessions,
  accounts,
  verifications,
} from "./schema";
import { userRoleEnum } from "./schema/enums";

// ── Row types (SELECT) ─────────────────────────────────────────────────
export type UserRecord = typeof users.$inferSelect;
export type FileRecord = typeof files.$inferSelect;
export type DocumentRecord = typeof documents.$inferSelect;
export type ExtractionRecord = typeof extractions.$inferSelect;

export type AuthUserRecord = typeof users.$inferSelect;
export type AuthSessionRecord = typeof sessions.$inferSelect;
export type AuthAccountRecord = typeof accounts.$inferSelect;
export type AuthVerificationRecord = typeof verifications.$inferSelect;


// ── Column-level utility types ─────────────────────────────────────────
export type FileBucket = typeof files.$inferInsert["bucket"];
export type FileStatus = typeof files.$inferInsert["status"];
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type DocumentType = typeof documents.$inferInsert["documentType"];
export type DocumentStatus = typeof documents.$inferInsert["status"];
export type ExtractionStatus = typeof extractions.$inferInsert["status"];

