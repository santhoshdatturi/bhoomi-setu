import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { update } from "@/lib/services/users.service";
import { ServiceErrorCode } from "@/lib/services/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Authenticate caller
  const authResult = await requireAuth();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error.userMessage, code: authResult.error.code },
      { status: authResult.error.statusCode }
    );
  }

  const authUser = authResult.data;

  // 2. Authorize caller (only admin can update users)
  if (authUser.role !== "admin") {
    return NextResponse.json(
      {
        error: "Only administrators are authorized to update users.",
        code: ServiceErrorCode.FORBIDDEN,
      },
      { status: 403 }
    );
  }

  // 3. Perform update
  try {
    const { id } = await params;
    const body = await request.json();

    const updateResult = await update(id, body);
    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error.userMessage, code: updateResult.error.code },
        { status: updateResult.error.statusCode }
      );
    }

    return NextResponse.json({ success: true, data: updateResult.data });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body", code: ServiceErrorCode.VALIDATION_FAILED },
      { status: 400 }
    );
  }
}
