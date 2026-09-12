import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import * as extractionsService from "@/lib/services/extractions.service";
import { toApiResponse } from "@/lib/services/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: NextRequest,
  context: RouteParams
) {
  const authResult = await requireAuth();
  if (!authResult.success) return toApiResponse(authResult);

  const { id } = await context.params;
  const result = await extractionsService.processDocument(id);
  return toApiResponse(result);
}
