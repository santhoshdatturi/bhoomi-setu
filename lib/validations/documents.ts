import { createInsertSchema } from "drizzle-zod";
import { documents } from "@/lib/db/schema/documents";
import { documentTypeEnum, documentStatusEnum } from "@/lib/db/schema/enums";
import { z } from "zod";

export const insertDocumentSchema = createInsertSchema(documents, {
  fileId: z.string().uuid("Invalid File ID"),
  title: z.string().min(1, "Title is required").max(255),
  fileName: z.string().min(1, "File name is required"),
  state: z.string().max(100).optional().nullable(),
  uploadedBy: z.string().min(1, "Uploader ID is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDocumentSchema = insertDocumentSchema.partial();

export const documentFilterSchema = z.object({
  status: z.enum(documentStatusEnum.enumValues).optional(),
  documentType: z.enum(documentTypeEnum.enumValues).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type InsertDocumentInput = z.infer<typeof insertDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type DocumentFilterInput = z.infer<typeof documentFilterSchema>;
