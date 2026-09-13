import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as filesService from "@/lib/services/files.service";
import { toApiResponse, fail, ok, ServiceErrorCode } from "@/lib/services/errors";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.success) return toApiResponse(authResult);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return toApiResponse(
        fail(ServiceErrorCode.VALIDATION_FAILED, "No file provided in form data")
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await filesService.uploadDirect(buffer, {
      name: file.name,
      mimeType: file.type || "application/pdf",
      sizeBytes: file.size,
      createdBy: authResult.data.id,
    });

    if (!result.success) return toApiResponse(result);

    return toApiResponse(
      ok({
        fileId: result.data.id,
        file: result.data,
      }),
      201
    );
  } catch (err) {
    return toApiResponse(
      fail(ServiceErrorCode.FILE_OPERATION_FAILED, "Failed to process file upload", err)
    );
  }
}
