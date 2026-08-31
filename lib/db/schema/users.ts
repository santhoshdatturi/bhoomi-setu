import { pgTable, text, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum } from "./enums";
import { files } from "./files";

export const profiles = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    displayName: text("display_name"),
    role: userRoleEnum("role").default("user").notNull(),
    bio: text("bio"),
    avatarFileId: uuid("avatar_file_id").references(() => files.id),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_profiles_username").on(table.username),
    index("idx_profiles_role").on(table.role),
  ]
);

export const profilesRelations = relations(profiles, ({ one }) => ({
  avatarFile: one(files, {
    fields: [profiles.avatarFileId],
    references: [files.id],
  }),
}));
