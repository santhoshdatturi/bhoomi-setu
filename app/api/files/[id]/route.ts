import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as filesService from "@/lib/services/files.service";
import { toApiResponse } from "@/lib/services/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (!authResult.success) return toApiResponse(authResult);

  const { id } = await params;
  const result = await filesService.getDownloadUrl(id);
  return toApiResponse(result);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (!authResult.success) return toApiResponse(authResult);

  const { id } = await params;
  const result = await filesService.deleteFileRecord(id);
  return toApiResponse(result);
}
