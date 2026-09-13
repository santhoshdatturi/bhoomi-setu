import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import {
  type ServiceResult,
  ServiceErrorCode,
  ok,
  fail,
} from "@/lib/services/errors";
import type { UserRecord } from "@/lib/db/types";
import { insertUserSchema, updateUserSchema } from "@/lib/validations/users";

export async function create(
  payload: typeof users.$inferInsert
): Promise<ServiceResult<UserRecord>> {
  try {
    const validationResult = insertUserSchema.safeParse(payload);
    if (!validationResult.success) {
      return fail(
        ServiceErrorCode.VALIDATION_FAILED,
        validationResult.error.message
      );
    }

    const { data } = validationResult;
    const [user] = await db
      .insert(users)
      .values({
        ...data,
      })
      .returning();

    if (!user) {
      return fail(
        ServiceErrorCode.DB_ERROR,
        "Failed to insert user record"
      );
    }

    return ok(user);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during user creation",
      error
    );
  }
}

export async function get(id: string): Promise<ServiceResult<UserRecord>> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return fail(ServiceErrorCode.NOT_FOUND, `User not found with ID: ${id}`);
    }

    return ok(user);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during user fetch",
      error
    );
  }
}

export async function getByAuthId(authUserId: string): Promise<ServiceResult<UserRecord>> {
  return get(authUserId);
}

export async function list(): Promise<ServiceResult<UserRecord[]>> {
  try {
    const results = await db.select().from(users);
    return ok(results);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during users listing",
      error
    );
  }
}

export async function update(
  id: string,
  payload: Partial<typeof users.$inferInsert>
): Promise<ServiceResult<UserRecord>> {
  try {
    const validationResult = updateUserSchema.safeParse(payload);
    if (!validationResult.success) {
      return fail(
        ServiceErrorCode.VALIDATION_FAILED,
        validationResult.error.message
      );
    }

    const { data } = validationResult;
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      return fail(ServiceErrorCode.NOT_FOUND, `User not found to update with ID: ${id}`);
    }

    return ok(user);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during user update",
      error
    );
  }
}

