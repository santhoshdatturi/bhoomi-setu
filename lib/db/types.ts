import type {
  profiles,
  files,
} from "./schema";

// ── Row types (SELECT) ─────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect;
export type FileRecord = typeof files.$inferSelect;

// ── Column-level utility types ─────────────────────────────────────────
export type FileBucket = typeof files.$inferInsert["bucket"];
export type FileStatus = typeof files.$inferInsert["status"];
export type UserRole = typeof profiles.$inferInsert["role"];
