import { pgEnum } from "drizzle-orm/pg-core";

export const fileBucketEnum = pgEnum("file_bucket", [
  "app",
  "documents",
]);

export const fileStatusEnum = pgEnum("file_status", [
  "uploaded",
  "linked",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "reviewer",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "rtc",
  "khata",
  "mutation",
  "sale_deed",
  "patta",
  "land_tax_receipt",
  "survey_map",
  "other",
  "unknown",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "uploaded",
  "processing",
  "extracted",
  "failed",
]);

export const extractionStatusEnum = pgEnum("extraction_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "review_required",
]);
