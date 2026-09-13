import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error.userMessage, code: authResult.error.code },
      { status: authResult.error.statusCode }
    );
  }

  return NextResponse.json({ success: true, data: authResult.data });
}
