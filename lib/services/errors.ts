import { createLogger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// ServiceErrorCode — exhaustive enum of every error code across all domains.
// Add new codes here as the app grows. Never remove codes (mark deprecated).
// ---------------------------------------------------------------------------

export const ServiceErrorCode = {
  // ── Auth / Authz ──────────────────────────────────────────
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // ── Generic CRUD ──────────────────────────────────────────
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  CONFLICT: "CONFLICT",

  // ── Storage / Files ───────────────────────────────────────
  FILE_OPERATION_FAILED: "FILE_OPERATION_FAILED",
  FILE_IN_USE: "FILE_IN_USE",

  // ── Database ──────────────────────────────────────────────
  DB_ERROR: "DB_ERROR",

  // ── AI Service / Extraction ────────────────────────────────
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",

  // ── Catch-all ─────────────────────────────────────────────
  INTERNAL: "INTERNAL",
} as const;

export type ServiceErrorCode =
  (typeof ServiceErrorCode)[keyof typeof ServiceErrorCode];

// ---------------------------------------------------------------------------
// ERROR_MESSAGES — user-safe messages that never reveal domain internals.
// Server actions and API routes both pull from this map.
// ---------------------------------------------------------------------------

export const ERROR_MESSAGES: Record<ServiceErrorCode, string> = {
  [ServiceErrorCode.UNAUTHORIZED]:
    "You must be signed in to perform this action.",
  [ServiceErrorCode.FORBIDDEN]:
    "You do not have permission to perform this action.",
  [ServiceErrorCode.NOT_FOUND]:
    "The requested resource was not found.",
  [ServiceErrorCode.VALIDATION_FAILED]:
    "The provided data is invalid. Please check your input.",
  [ServiceErrorCode.CONFLICT]:
    "This operation conflicts with an existing record.",
  [ServiceErrorCode.FILE_OPERATION_FAILED]:
    "A file operation failed. Please try again.",
  [ServiceErrorCode.FILE_IN_USE]:
    "This file is currently in use and cannot be deleted.",
  [ServiceErrorCode.DB_ERROR]:
    "A database error occurred. Please try again.",
  [ServiceErrorCode.AI_SERVICE_ERROR]:
    "An error occurred while communicating with the AI service.",
  [ServiceErrorCode.INTERNAL]:
    "An unexpected error occurred. Please try again later.",
};

// ---------------------------------------------------------------------------
// HTTP status mapping — for API route use.
// ---------------------------------------------------------------------------

const HTTP_STATUS: Record<ServiceErrorCode, number> = {
  [ServiceErrorCode.UNAUTHORIZED]: 401,
  [ServiceErrorCode.FORBIDDEN]: 403,
  [ServiceErrorCode.NOT_FOUND]: 404,
  [ServiceErrorCode.VALIDATION_FAILED]: 422,
  [ServiceErrorCode.CONFLICT]: 409,
  [ServiceErrorCode.FILE_OPERATION_FAILED]: 500,
  [ServiceErrorCode.FILE_IN_USE]: 409,
  [ServiceErrorCode.DB_ERROR]: 500,
  [ServiceErrorCode.AI_SERVICE_ERROR]: 502,
  [ServiceErrorCode.INTERNAL]: 500,
};

// ---------------------------------------------------------------------------
// ServiceErrorData — structured error object safe for Server Actions
// ---------------------------------------------------------------------------

export type ServiceErrorData = {
  code: ServiceErrorCode;
  message: string;
  userMessage: string;
  statusCode: number;
};

// ---------------------------------------------------------------------------
// ServiceResult<T> — discriminated union returned by every service function.
// ---------------------------------------------------------------------------

export type ServiceResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: ServiceErrorData };

// ---------------------------------------------------------------------------
// Factory helpers — keep service code concise.
// ---------------------------------------------------------------------------

/** Create a successful result. */
export function ok(): ServiceResult<void>;
export function ok<T>(data: T): ServiceResult<T>;
export function ok<T>(data?: T): ServiceResult<T> {
  return { success: true, data: data as T };
}

/** Create a failed result. */
export function fail(
  code: ServiceErrorCode,
  internalMessage?: string,
  cause?: unknown,
): ServiceResult<never> {
  const message = internalMessage ?? ERROR_MESSAGES[code];
  
  if (cause) {
    const log = createLogger("service.error");
    log.error({ code, cause }, message);
  }

  return {
    success: false,
    error: {
      code,
      message,
      userMessage: ERROR_MESSAGES[code],
      statusCode: HTTP_STATUS[code],
    },
  };
}

/** Convert a ServiceResult into a standard NextResponse for API routes. */
import { NextResponse } from "next/server";

export function toApiResponse<T>(
  result: ServiceResult<T>,
  successStatus: number = 200
): NextResponse {
  if (result.success) {
    return NextResponse.json({ success: true, data: result.data }, { status: successStatus });
  }

  const isDomainError =
    result.error.code === ServiceErrorCode.VALIDATION_FAILED ||
    result.error.code === ServiceErrorCode.NOT_FOUND ||
    result.error.code === ServiceErrorCode.CONFLICT;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: result.error.code,
        message: isDomainError && result.error.message ? result.error.message : result.error.userMessage,
        details: isDomainError && result.error.message !== result.error.userMessage ? result.error.message : undefined,
      },
    },
    { status: result.error.statusCode }
  );
}
