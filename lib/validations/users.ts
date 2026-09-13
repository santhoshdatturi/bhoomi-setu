import { createInsertSchema } from "drizzle-zod";
import { users } from "@/lib/db/schema/auth";
import { userRoleEnum } from "@/lib/db/schema/enums";
import { z } from "zod";

export const insertUserSchema = createInsertSchema(users, {
  email: z.email(),
  role: z.enum(userRoleEnum.enumValues),
});

export const updateUserSchema = insertUserSchema.partial();
