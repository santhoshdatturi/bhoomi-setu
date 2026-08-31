import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import {
  type ServiceResult,
  ServiceErrorCode,
  ok,
  fail,
} from "@/lib/services/errors";
import type { Profile } from "@/lib/db/types";
import { insertProfileSchema, updateProfileSchema } from "@/lib/validations/users";


export async function create(
  payload: typeof profiles.$inferInsert
): Promise<ServiceResult<Profile>> {
  try {
    const validationResult = insertProfileSchema.safeParse(payload);
    if (!validationResult.success) {
      return fail(
        ServiceErrorCode.VALIDATION_FAILED,
        validationResult.error.message
      );
    }

    const { data } = validationResult;
    const [profile] = await db
      .insert(profiles)
      .values({
        ...data,
      })
      .returning();

    if (!profile) {
      return fail(
        ServiceErrorCode.DB_ERROR,
        "Failed to insert profile record"
      );
    }

    return ok(profile);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during profile creation",
      error
    );
  }
}

export async function get(id: string): Promise<ServiceResult<Profile>> {
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    if (!profile) {
      return fail(ServiceErrorCode.NOT_FOUND, `Profile not found with ID: ${id}`);
    }

    return ok(profile);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during profile fetch",
      error
    );
  }
}

export async function getByAuthId(authUserId: string): Promise<ServiceResult<Profile>> {
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.authUserId, authUserId))
      .limit(1);

    if (!profile) {
      return fail(
        ServiceErrorCode.NOT_FOUND,
        `Profile not found with Auth User ID: ${authUserId}`
      );
    }

    return ok(profile);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during profile fetch by auth ID",
      error
    );
  }
}

export async function list(): Promise<ServiceResult<Profile[]>> {
  try {
    const results = await db.select().from(profiles);
    return ok(results);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during profiles listing",
      error
    );
  }
}

export async function update(
  id: string,
  payload: Partial<typeof profiles.$inferInsert>
): Promise<ServiceResult<Profile>> {
  try {
    const validationResult = updateProfileSchema.safeParse(payload);
    if (!validationResult.success) {
      return fail(
        ServiceErrorCode.VALIDATION_FAILED,
        validationResult.error.message
      );
    }

    const { data } = validationResult;
    const [profile] = await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(profiles.id, id))
      .returning();

    if (!profile) {
      return fail(ServiceErrorCode.NOT_FOUND, `Profile not found to update with ID: ${id}`);
    }

    return ok(profile);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during profile update",
      error
    );
  }
}
