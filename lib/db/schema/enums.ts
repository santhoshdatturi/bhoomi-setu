import { pgEnum } from "drizzle-orm/pg-core";

export const fileBucketEnum = pgEnum("file_bucket", [
  "bhoomi-setu-app",
  "bhoomi-setu-public",
  "bhoomi-setu-private",
  "bhoomi-setu-documents",
]);

export const fileStatusEnum = pgEnum("file_status", [
  "uploaded",
  "linked",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "reviewer",
]);
