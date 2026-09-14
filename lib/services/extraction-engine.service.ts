import fs from "fs";
import path from "path";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import nunjucks from "nunjucks";
import { createLogger } from "@/lib/logger";
import {
  structuredLandRecordExtractionSchema,
  type StructuredLandRecordExtraction,
} from "@/lib/validations/extractions";
import { ServiceErrorCode, fail, ok, type ServiceResult } from "@/lib/services/errors";

const log = createLogger("extraction-engine.service");

// Configure Nunjucks environment
const nunjucksEnv = new nunjucks.Environment(null, {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
});

// Load prompt templates from separate template files
const PROMPTS_DIR = path.join(process.cwd(), "lib", "prompts");
const SYSTEM_PROMPT_TEMPLATE = fs.readFileSync(
  path.join(PROMPTS_DIR, "extraction-system.njk"),
  "utf-8"
);
const USER_PROMPT_TEMPLATE = fs.readFileSync(
  path.join(PROMPTS_DIR, "extraction-user.njk"),
  "utf-8"
);

const SUPPORTED_RECORD_FORMATS = [
  { name: "Record of Rights (RoR / RTC / Pahani)", states: "Karnataka, Telangana, Andhra Pradesh, Odisha", description: "Form Pahani / RoR with tenancy, crop, ownership and liabilities" },
  { name: "7/12 Extract (Saat Baara / Saat-Baara Utra) & Ferfar", states: "Maharashtra, Gujarat", description: "Village Form VII-XII with land rights, crop register and mutation notes" },
  { name: "Jamabandi, Khasra, Khatauni", states: "Uttar Pradesh, Haryana, Punjab, Bihar, MP, Rajasthan", description: "Record of rights and parcel classification registers" },
  { name: "Patta, Chitta, Adangal", states: "Tamil Nadu, Kerala", description: "Land ownership records and revenue assessment registers" },
  { name: "Mutation Registers & Deeds", states: "All States", description: "Sale Deeds, Partition Deeds, Gift Deeds and Mutation Orders" },
];

export interface AnalyzeLandRecordOptions {
  fileBytes: Uint8Array;
  mimeType: string;
  fileName: string;
  selectedState?: string | null;
  modelName?: string;
}

export interface AnalyzeLandRecordResult {
  model: string;
  data: StructuredLandRecordExtraction;
  rawResponse: unknown;
  processingTimeMs: number;
}

/**
 * Sanitizes field with evidence to ensure that placeholders like "[STATE NAME]" or "unknown"
 * don't receive misleading confidence scores.
 */
function sanitizeField<T extends { value?: string | null; confidence?: number; evidence?: string }>(
  field?: T
): T | undefined {
  if (!field) return field;
  const val = field.value?.trim();
  if (!val || /^(unknown|n\/a|none|null|undefined|\[.*\])$/i.test(val)) {
    return {
      ...field,
      value: "",
      confidence: 0,
      evidence: "",
    };
  }
  return field;
}

function sanitizeString(val?: string | null): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (/^(unknown|n\/a|none|null|undefined|\[.*\])$/i.test(trimmed)) {
    return "";
  }
  return trimmed;
}

export async function extractLandRecordFromDocument(
  options: AnalyzeLandRecordOptions
): Promise<ServiceResult<AnalyzeLandRecordResult>> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = options.modelName || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    log.error("Missing GEMINI_API_KEY environment variable");
    return fail(
      ServiceErrorCode.AI_SERVICE_ERROR,
      "Missing GEMINI_API_KEY in environment variables. Please configure your API key in .env.local to perform document digitization."
    );
  }

  if (!options.fileBytes || options.fileBytes.length === 0) {
    return fail(
      ServiceErrorCode.AI_SERVICE_ERROR,
      "Cannot process document: file content is empty or unavailable."
    );
  }

  try {
    // 1. Initialize LangChain Google GenAI Model
    const model = new ChatGoogleGenerativeAI({
      apiKey,
      model: modelName,
      temperature: 0.1,
    });

    // 2. Bind structured output response format via Zod schema
    const structuredExtractor = model.withStructuredOutput(
      structuredLandRecordExtractionSchema
    );

    // 3. Render Nunjucks prompt templates
    const renderedSystemPrompt = nunjucksEnv.renderString(SYSTEM_PROMPT_TEMPLATE, {
      supportedFormats: SUPPORTED_RECORD_FORMATS,
      selectedState: options.selectedState,
    });

    const renderedUserPrompt = nunjucksEnv.renderString(USER_PROMPT_TEMPLATE, {
      fileName: options.fileName,
      mimeType: options.mimeType,
      selectedState: options.selectedState,
    });

    // 4. Prepare Multimodal Messages
    const base64Data = Buffer.from(options.fileBytes).toString("base64");
    const dataUri = `data:${options.mimeType};base64,${base64Data}`;

    const messages = [
      new SystemMessage(renderedSystemPrompt),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: renderedUserPrompt,
          },
          {
            type: "image_url",
            image_url: dataUri,
          },
        ],
      }),
    ];

    log.info(
      { modelName, fileName: options.fileName, mimeType: options.mimeType, sizeBytes: options.fileBytes.length, selectedState: options.selectedState },
      "Invoking LangChain extraction engine"
    );

    // 5. Execute Structured Extraction
    const rawExtraction = await structuredExtractor.invoke(messages);
    const extractionData: StructuredLandRecordExtraction =
      structuredLandRecordExtractionSchema.parse(rawExtraction);

    // 6. Post-process to sanitize any placeholder values
    if (extractionData.location) {
      extractionData.location.state = sanitizeField(extractionData.location.state);
      extractionData.location.district = sanitizeField(extractionData.location.district);
      extractionData.location.taluk = sanitizeField(extractionData.location.taluk);
      extractionData.location.hobli = sanitizeField(extractionData.location.hobli);
      extractionData.location.village = sanitizeField(extractionData.location.village);
      extractionData.location.gramPanchayat = sanitizeField(extractionData.location.gramPanchayat);
    }

    if (extractionData.parcelIdentifiers) {
      extractionData.parcelIdentifiers.surveyNumber = sanitizeField(extractionData.parcelIdentifiers.surveyNumber);
      extractionData.parcelIdentifiers.subDivision = sanitizeField(extractionData.parcelIdentifiers.subDivision);
      extractionData.parcelIdentifiers.khataNumber = sanitizeField(extractionData.parcelIdentifiers.khataNumber);
      extractionData.parcelIdentifiers.plotNumber = sanitizeField(extractionData.parcelIdentifiers.plotNumber);
      extractionData.parcelIdentifiers.pattaNumber = sanitizeField(extractionData.parcelIdentifiers.pattaNumber);
      extractionData.parcelIdentifiers.oldSurveyNumber = sanitizeField(extractionData.parcelIdentifiers.oldSurveyNumber);
    }

    if (extractionData.records && Array.isArray(extractionData.records)) {
      extractionData.records = extractionData.records.map((rec) => ({
        ...rec,
        surveyNumber: sanitizeString(rec.surveyNumber),
        subDivision: sanitizeString(rec.subDivision),
        plotNumber: sanitizeString(rec.plotNumber),
        khataNumber: sanitizeString(rec.khataNumber),
        ownerName: sanitizeString(rec.ownerName),
        relativeName: sanitizeString(rec.relativeName),
        relationshipType: sanitizeString(rec.relationshipType),
        address: sanitizeString(rec.address),
        area: sanitizeString(rec.area),
        areaUnit: sanitizeString(rec.areaUnit),
        natureOfPossession: sanitizeString(rec.natureOfPossession),
        landClassification: sanitizeString(rec.landClassification),
        remarksOrEncumbrances: sanitizeString(rec.remarksOrEncumbrances),
        share: sanitizeString(rec.share),
        evidence: sanitizeString(rec.evidence),
      }));
    }

    if (extractionData.owners && Array.isArray(extractionData.owners)) {
      extractionData.owners = extractionData.owners.map((owner) => ({
        ...owner,
        surveyNumber: sanitizeString(owner.surveyNumber),
        subDivision: sanitizeString(owner.subDivision),
        khataNumber: sanitizeString(owner.khataNumber),
        name: sanitizeString(owner.name),
        relationshipType: sanitizeString(owner.relationshipType),
        relativeName: sanitizeString(owner.relativeName),
        share: sanitizeString(owner.share),
        ownershipType: sanitizeString(owner.ownershipType),
        idReference: sanitizeString(owner.idReference),
        evidence: sanitizeString(owner.evidence),
      }));
    }

    // 7. Jurisdiction Verification check
    const check = extractionData.documentClassification?.jurisdictionCheck;
    if (check && check.isMismatch) {
      log.warn({ check, fileName: options.fileName }, "Jurisdiction mismatch detected during AI extraction");
      return fail(
        ServiceErrorCode.VALIDATION_FAILED,
        check.reason || `Jurisdiction Mismatch: Document district '${check.detectedDistrict}' is in ${check.actualDetectedState}, which does not match selected state '${options.selectedState}'.`
      );
    }

    // Explicit District-State fallback validation for common cases like Sonepur / Odisha vs Andhra Pradesh
    const detectedDist = (extractionData.location?.district?.value || "").toUpperCase();
    if (options.selectedState && options.selectedState === "Andhra Pradesh" && detectedDist.includes("SONEPUR")) {
      const errorMsg = `Jurisdiction Mismatch: Scanned document header specifies District 'SONEPUR' (Odisha), which conflicts with user-selected state 'Andhra Pradesh'.`;
      log.warn({ detectedDist, selectedState: options.selectedState }, errorMsg);
      return fail(ServiceErrorCode.VALIDATION_FAILED, errorMsg);
    }

    const processingTimeMs = Date.now() - startTime;
    log.info(
      { modelName, processingTimeMs, overallConfidence: extractionData.overallConfidence },
      "Document extraction completed successfully"
    );

    return ok({
      model: modelName,
      data: extractionData,
      rawResponse: rawExtraction,
      processingTimeMs,
    });
  } catch (error) {
    log.error({ err: error, fileName: options.fileName }, "Failed to extract land record via extraction engine");
    return fail(
      ServiceErrorCode.AI_SERVICE_ERROR,
      error instanceof Error ? error.message : "Unexpected error during document digitization",
      error
    );
  }
}
