import { db } from "@/lib/db";
import { extractions } from "@/lib/db/schema/extractions";
import { documents } from "@/lib/db/schema/documents";
import { eq, desc } from "drizzle-orm";
import {
  type ServiceResult,
  ServiceErrorCode,
  ok,
  fail,
} from "@/lib/services/errors";
import type { ExtractionRecord } from "@/lib/db/types";
import * as documentsService from "@/lib/services/documents.service";
import * as filesService from "@/lib/services/files.service";
import * as extractionEngineService from "@/lib/services/extraction-engine.service";
import { createLogger } from "@/lib/logger";

const log = createLogger("extractions.service");

export async function getLatestByDocumentId(
  documentId: string
): Promise<ServiceResult<ExtractionRecord>> {
  try {
    const [latestExtraction] = await db
      .select()
      .from(extractions)
      .where(eq(extractions.documentId, documentId))
      .orderBy(desc(extractions.createdAt))
      .limit(1);

    if (!latestExtraction) {
      return fail(
        ServiceErrorCode.NOT_FOUND,
        `No extraction found for document ID: ${documentId}`
      );
    }

    return ok(latestExtraction);
  } catch (error) {
    return fail(
      ServiceErrorCode.DB_ERROR,
      `Failed to retrieve extraction for document ID: ${documentId}`,
      error
    );
  }
}

export async function processDocument(
  documentId: string
): Promise<ServiceResult<ExtractionRecord>> {
  const modelName = process.env.EXTRACTION_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    // 1. Fetch document record
    const docResult = await documentsService.get(documentId);
    if (!docResult.success) {
      return docResult;
    }
    const document = docResult.data;

    // 2. Mark document as processing
    await documentsService.updateStatus(documentId, "processing");

    // 3. Obtain file bytes from storage
    const fileBytesResult = await filesService.getFileContentBytes(document.fileId);
    if (!fileBytesResult.success) {
      log.error({ fileId: document.fileId }, "Could not fetch document file content from storage");
      await documentsService.updateStatus(documentId, "failed");
      await db.insert(extractions).values({
        documentId,
        status: "failed",
        errorMessage: fileBytesResult.error.message,
      });
      return fail(
        ServiceErrorCode.FILE_OPERATION_FAILED,
        fileBytesResult.error.message
      );
    }

    const { bytes: fileBytes, mimeType } = fileBytesResult.data;

    // 4. Run structured land record extraction
    const extractionResult = await extractionEngineService.extractLandRecordFromDocument({
      fileBytes,
      mimeType,
      fileName: document.fileName,
      selectedState: document.state,
      modelName,
    });

    if (!extractionResult.success) {
      log.error({ err: extractionResult.error, documentId }, "Document extraction failed");
      await documentsService.updateStatus(documentId, "failed");
      await db.insert(extractions).values({
        documentId,
        status: "failed",
        errorMessage: extractionResult.error.message,
      });
      return extractionResult;
    }

    const { data: structuredData } = extractionResult.data;

    // 5. Execute atomic database transaction
    const [savedExtraction] = await db.transaction(async (tx) => {
      // Insert extraction record with structured land record fields directly
      const [newExtraction] = await tx
        .insert(extractions)
        .values({
          documentId,
          status: "completed",
          confidenceScore: Math.round(structuredData.overallConfidence),
          documentClassification: structuredData.documentClassification,
          location: structuredData.location,
          parcelIdentifiers: structuredData.parcelIdentifiers,
          owners: structuredData.owners,
          extent: structuredData.extent,
          mutationInformation: structuredData.mutationInformation,
          registrationInformation: structuredData.registrationInformation,
          liabilities: structuredData.liabilities,
          remarks: structuredData.remarks,
        })
        .returning();

      if (!newExtraction) {
        throw new Error("Failed to insert extraction row inside transaction");
      }

      // Update document status to extracted and sync detected metadata
      await tx
        .update(documents)
        .set({
          status: "extracted",
          documentType: structuredData.documentClassification.documentType || document.documentType,
          state: structuredData.documentClassification.state || document.state,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(documents.id, documentId));

      return [newExtraction];
    });

    return ok(savedExtraction);
  } catch (error) {
    log.error({ err: error, documentId }, "Document processing error");

    const technicalErrorMessage = error instanceof Error ? error.message : String(error);

    try {
      await documentsService.updateStatus(documentId, "failed");

      await db.insert(extractions).values({
        documentId,
        status: "failed",
        errorMessage: technicalErrorMessage,
      });
    } catch (cleanupError) {
      log.error({ cleanupError }, "Failed to update failure state for document");
    }

    return fail(
      ServiceErrorCode.AI_SERVICE_ERROR,
      technicalErrorMessage,
      error
    );
  }
}
