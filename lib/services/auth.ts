import { auth } from "@/lib/auth/server";
import { createLogger } from "@/lib/logger";
import { ServiceErrorCode, fail, ok, type ServiceResult } from "./errors";

const log = createLogger("auth");

export type AuthUser = NonNullable<Awaited<ReturnType<typeof auth.getSession>>["data"]>["user"];

/**
 * Require an authenticated user. Returns the Better Auth user object on success.
 */
export async function requireAuth(): Promise<ServiceResult<AuthUser>> {
  try {
    const session = await auth.getSession({
      query: {
        disableRefresh: "true",
      },
    });

    if (!session || !session.data?.user) {
      log.warn({ err: session?.error }, "Auth check failed — no authenticated user");
      return fail(ServiceErrorCode.UNAUTHORIZED);
    }

    return ok(session.data.user);
  } catch (error) {
    return fail(
      ServiceErrorCode.INTERNAL,
      "Failed to retrieve auth session",
      error
    );
  }
}
