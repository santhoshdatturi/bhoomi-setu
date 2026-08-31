import { pgTable, text, timestamp, index, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum } from "./enums";
import { files } from "./files";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authUserId: text("auth_user_id").notNull().unique(),
    displayName: text("display_name").notNull(),
    role: userRoleEnum("role").default("reviewer").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    avatarFileId: uuid("avatar_file_id").references(() => files.id),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_profiles_auth_user_id").on(table.authUserId),
    index("idx_profiles_role").on(table.role),
  ]
);

export const profilesRelations = relations(profiles, ({ one }) => ({
  avatarFile: one(files, {
    fields: [profiles.avatarFileId],
    references: [files.id],
  }),
}));
