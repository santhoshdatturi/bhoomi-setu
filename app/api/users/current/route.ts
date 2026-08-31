import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import { getByAuthId } from "@/lib/services/users.service";
import { ServiceErrorCode } from "@/lib/services/errors";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error.userMessage, code: authResult.error.code },
      { status: authResult.error.statusCode }
    );
  }

  const authUser = authResult.data;
  const profileResult = await getByAuthId(authUser.id);

  if (!profileResult.success) {
    return NextResponse.json(
      {
        error: "Access denied. User profile not found in database.",
        code: ServiceErrorCode.FORBIDDEN,
      },
      { status: 403 }
    );
  }

  const profile = profileResult.data;
  if (!profile.isActive) {
    return NextResponse.json(
      {
        error: "Access denied. Your account is currently inactive.",
        code: ServiceErrorCode.FORBIDDEN,
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, data: profile });
}
