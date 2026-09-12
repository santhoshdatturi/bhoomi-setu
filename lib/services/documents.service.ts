import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import {
  type ServiceResult,
  ServiceErrorCode,
  ok,
  fail,
} from "@/lib/services/errors";
import type { DocumentRecord, DocumentStatus, DocumentType } from "@/lib/db/types";
import {
  insertDocumentSchema,
  updateDocumentSchema,
  type DocumentFilterInput,
} from "@/lib/validations/documents";
import { markFileLinked } from "@/lib/services/files.service";

export interface PaginatedDocumentsResult {
  documents: DocumentRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    total: number;
    uploaded: number;
    processing: number;
    extracted: number;
    failed: number;
  };
}

export async function create(
  payload: typeof documents.$inferInsert
): Promise<ServiceResult<DocumentRecord>> {
  try {
    const validationResult = insertDocumentSchema.safeParse(payload);
    if (!validationResult.success) {
      return fail(
        ServiceErrorCode.VALIDATION_FAILED,
        validationResult.error.message
      );
    }

    const { data } = validationResult;
    const [document] = await db
      .insert(documents)
      .values({
        ...data,
      })
      .returning();

    if (!document) {
      return fail(ServiceErrorCode.DB_ERROR, "Failed to insert document record");
    }

    // Server-side linking: mark the file as linked to this document
    if (document.fileId) {
      await markFileLinked(document.fileId);
    }

    return ok(document);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during document creation",
      error
    );
  }
}

export async function get(id: string): Promise<ServiceResult<DocumentRecord>> {
  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!document) {
      return fail(ServiceErrorCode.NOT_FOUND, `Document not found with ID: ${id}`);
    }

    return ok(document);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during document fetch",
      error
    );
  }
}

export async function list(
  filters: DocumentFilterInput = { page: 1, limit: 20 }
): Promise<ServiceResult<PaginatedDocumentsResult>> {
  try {
    const { page, limit, status, documentType, search } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status) {
      conditions.push(eq(documents.status, status));
    }
    if (documentType) {
      conditions.push(eq(documents.documentType, documentType));
    }
    if (search && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(documents.title, term),
          ilike(documents.fileName, term),
          ilike(documents.state, term)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch paginated results
    const [records, countResult, statsResult] = await Promise.all([
      db
        .select()
        .from(documents)
        .where(whereClause)
        .orderBy(desc(documents.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(documents)
        .where(whereClause),
      db
        .select({
          total: sql<number>`count(*)::int`,
          uploaded: sql<number>`count(*) filter (where ${documents.status} = 'uploaded')::int`,
          processing: sql<number>`count(*) filter (where ${documents.status} = 'processing')::int`,
          extracted: sql<number>`count(*) filter (where ${documents.status} = 'extracted')::int`,
          failed: sql<number>`count(*) filter (where ${documents.status} = 'failed')::int`,
        })
        .from(documents),
    ]);

    const total = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;
    const stats = statsResult[0] ?? {
      total: 0,
      uploaded: 0,
      processing: 0,
      extracted: 0,
      failed: 0,
    };

    return ok({
      documents: records,
      total,
      page,
      limit,
      totalPages,
      stats,
    });
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during documents list fetch",
      error
    );
  }
}

export async function update(
  id: string,
  payload: Partial<typeof documents.$inferInsert>
): Promise<ServiceResult<DocumentRecord>> {
  try {
    const validationResult = updateDocumentSchema.safeParse(payload);
    if (!validationResult.success) {
      return fail(
        ServiceErrorCode.VALIDATION_FAILED,
        validationResult.error.message
      );
    }

    const { data } = validationResult;
    const [updated] = await db
      .update(documents)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, id))
      .returning();

    if (!updated) {
      return fail(ServiceErrorCode.NOT_FOUND, `Document not found with ID: ${id}`);
    }

    return ok(updated);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      "Unhandled database error during document update",
      error
    );
  }
}

export async function updateStatus(
  id: string,
  status: DocumentStatus,
  metadata?: {
    documentType?: DocumentType;
    state?: string | null;
  }
): Promise<ServiceResult<DocumentRecord>> {
  try {
    const [updated] = await db
      .update(documents)
      .set({
        status,
        ...(metadata?.documentType ? { documentType: metadata.documentType } : {}),
        ...(metadata?.state !== undefined ? { state: metadata.state } : {}),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, id))
      .returning();

    if (!updated) {
      return fail(ServiceErrorCode.NOT_FOUND, `Document not found with ID: ${id}`);
    }

    return ok(updated);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      `Failed to update status for document ID: ${id}`,
      error
    );
  }
}

export async function remove(id: string): Promise<ServiceResult<void>> {
  try {
    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning({ id: documents.id });

    if (!deleted) {
      return fail(ServiceErrorCode.NOT_FOUND, `Document not found with ID: ${id}`);
    }

    return ok();
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      `Failed to delete document ID: ${id}`,
      error
    );
  }
}
