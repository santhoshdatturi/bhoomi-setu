import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as documentsService from "@/lib/services/documents.service";
import * as filesService from "@/lib/services/files.service";
import * as extractionsService from "@/lib/services/extractions.service";
import { updateDocumentSchema } from "@/lib/validations/documents";
import { toApiResponse, fail, ok, ServiceErrorCode } from "@/lib/services/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteParams
) {
  const authResult = await requireAuth();
  if (!authResult.success) return toApiResponse(authResult);

  const { id } = await context.params;

  // 1. Fetch document record
  const docResult = await documentsService.get(id);
  if (!docResult.success) return toApiResponse(docResult);

  const document = docResult.data;

  // 2. Fetch file presigned download URL for viewing
  let downloadUrl: string | null = null;
  let fileRecord = null;
  try {
    const fileResult = await filesService.getDownloadUrl(document.fileId);
    if (fileResult.success) {
      downloadUrl = fileResult.data.downloadUrl;
      fileRecord = fileResult.data.file;
    }
  } catch {
    // Gracefully handle local/mock environments without S3 credentials
  }

  // 3. Fetch latest extraction result (if any)
  let latestExtraction = null;
  const extractionResult = await extractionsService.getLatestByDocumentId(id);
  if (extractionResult.success) {
    latestExtraction = extractionResult.data;
  }

  return toApiResponse(
    ok({
      document,
      file: fileRecord,
      downloadUrl,
      extraction: latestExtraction,
    })
  );
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  const authResult = await requireAuth();
  if (!authResult.success) return toApiResponse(authResult);

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return toApiResponse(fail(ServiceErrorCode.VALIDATION_FAILED, parsed.error.message));
    }

    const result = await documentsService.update(id, parsed.data);
    return toApiResponse(result);
  } catch (err) {
    return toApiResponse(fail(ServiceErrorCode.VALIDATION_FAILED, "Invalid JSON request body", err));
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteParams
) {
  const authResult = await requireAuth();
  if (!authResult.success) return toApiResponse(authResult);

  const { id } = await context.params;
  const result = await documentsService.remove(id);
  return toApiResponse(result);
}
