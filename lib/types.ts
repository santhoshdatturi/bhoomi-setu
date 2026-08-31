/**
 * Re-export the service layer error types as the canonical application types.
 */
export {
  type ServiceResult,
  type ServiceResult as ActionResult,
  type ServiceErrorData,
  type ServiceErrorData as ActionError,
  ServiceErrorCode,
  ERROR_MESSAGES,
  ok,
  fail,
} from "@/lib/services/errors";
