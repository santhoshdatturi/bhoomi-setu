import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import * as filesService from "@/lib/services/files.service";
import { z } from "zod";
import { fileBucketEnum } from "@/lib/db/schema/enums";
import { toApiResponse, fail, ServiceErrorCode } from "@/lib/services/errors";

const createFileRecordSchema = z.object({
  name: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
  bucket: z.enum(fileBucketEnum.enumValues).optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.success) return toApiResponse(authResult);

  try {
    const body = await request.json();
    const parsed = createFileRecordSchema.safeParse(body);

    if (!parsed.success) {
      return toApiResponse(fail(ServiceErrorCode.VALIDATION_FAILED, parsed.error.message));
    }

    const { name, sizeBytes, mimeType, bucket } = parsed.data;
    const result = await filesService.createFileRecord(
      name,
      sizeBytes,
      mimeType,
      bucket
    );

    return toApiResponse(result, 201);
  } catch (error) {
    return toApiResponse(fail(ServiceErrorCode.VALIDATION_FAILED, "Invalid JSON request body", error));
  }
}
