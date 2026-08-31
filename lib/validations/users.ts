import { createInsertSchema } from "drizzle-zod";
import { profiles } from "@/lib/db/schema/users";
import { z } from "zod";

export const insertProfileSchema = createInsertSchema(profiles, {
  authUserId: z.string().min(1, "Auth User ID is required"),
  displayName: z.string().min(1, "Display name is required"),
});

export const updateProfileSchema = insertProfileSchema.partial();
