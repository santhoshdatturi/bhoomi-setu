import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import { getByAuthId, update } from "@/lib/services/users.service";
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
  const callerProfileResult = await getByAuthId(authUser.id);

  if (!callerProfileResult.success) {
    return NextResponse.json(
      {
        error: "Access denied. User profile not found in database.",
        code: ServiceErrorCode.FORBIDDEN,
      },
      { status: 403 }
    );
  }

  // 2. Authorize caller (only admin can update profiles)
  const callerProfile = callerProfileResult.data;
  if (callerProfile.role !== "admin") {
    return NextResponse.json(
      {
        error: "Only administrators are authorized to update user profiles.",
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
