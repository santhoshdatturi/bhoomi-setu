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

const SYSTEM_PROMPT_TEMPLATE = `You are an expert system specialized in Indian Land Records Digitization, Cadastral Verification, and Document Extraction.
Your objective is to analyze scanned Indian land documents (PDFs, images, official revenue forms) and extract a highly structured, accurate representation of the land record draft.

Supported Land Record Formats:
{% for doc in supportedFormats %}
- {{ doc.name }} ({{ doc.states }}): {{ doc.description }}
{% endfor %}

Digitization Rules:
1. Multilingual Support: Indian land records often contain regional scripts (Kannada, Telugu, Marathi, Hindi, Tamil, Gujarati, Bengali, etc.). Accurately translate and transliterate names, locations, and land classifications into English while preserving native spellings where appropriate.
2. Field-level Confidence & Ground Truth:
   - For EVERY extracted field, provide an objective confidence score between 0 and 100 reflecting visual legibility and certainty.
   - STRICT PLACEHOLDER & ABSENT VALUE RULE: If a field is missing, not mentioned, unreadable, or contains a placeholder (such as '[STATE NAME]', '[District]', 'N/A', 'Unknown', '...', or blank lines), set the field's 'value' to null and its 'confidence' to 0. NEVER assign 50% or arbitrary non-zero confidence scores to absent or placeholder values.
   - Only assign high confidence (>80%) if the exact value is clearly legible in the document text.
   {% if selectedState %}
   - User-selected State Jurisdiction: "{{ selectedState }}". Use this state as high-confidence ground truth to interpret revenue forms, terminology, district hierarchy, and units.
   {% endif %}
3. Evidence Snippets: For EVERY extracted field that has a non-null value, provide an "evidence" string containing the exact verbatim quote found on the document where this field was identified. If absent or null, leave evidence empty.
4. Extent & Units: Extract total land extent and specify units accurately (e.g., Acres-Guntas, Hectares-Ares, Bigha-Biswa, Cents, Sq. Yards, Sq. Meters). Distinguish Cultivated vs Uncultivated/Pot Kharab land if indicated.
5. Ownership: List all khatedars/owners, including relationship (Father/Husband/Guardian) and their respective shares or joint status if present.
6. Mutation & History: Look for mutation register entries, order numbers, transaction dates, nature of acquisition (Inheritance/Virasat, Sale/Khareed, Partition/Batwara, Gift/Daan).
7. Liabilities & Encumbrances: Extract any bank hypothecation, agricultural loans, mortgage entries, or court stay notes found in the remarks/liabilities column.

Output strictly structured data conforming to the response format.`;

const USER_PROMPT_TEMPLATE = `Analyze the attached land record document (File: {{ fileName }}, MIME: {{ mimeType }}{% if selectedState %}, Selected State: {{ selectedState }}{% endif %}).
Extract all parcel identification, jurisdiction/location, owners with relationships, extent with units, mutation/registration details, liabilities, and assign field-level confidence scores (0-100) and verbatim evidence quotes.`;

const SUPPORTED_RECORD_FORMATS = [
  { name: "Record of Rights (RoR / RTC / Pahani)", states: "Karnataka, Telangana, Andhra Pradesh", description: "Form 16 Pahani with tenancy, crop, ownership and liabilities" },
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
function sanitizeField<T extends { value: string | null; confidence: number; evidence?: string }>(
  field?: T
): T | undefined {
  if (!field) return field;
  const val = field.value?.trim();
  if (!val || /^(unknown|n\/a|none|null|undefined|\[.*\])$/i.test(val)) {
    return {
      ...field,
      value: null,
      confidence: 0,
      evidence: "",
    };
  }
  return field;
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

    // 6. Post-process to sanitize any placeholder values (e.g. "[STATE NAME]")
    if (extractionData.location) {
      extractionData.location.state = sanitizeField(extractionData.location.state);
      extractionData.location.district = sanitizeField(extractionData.location.district);
      extractionData.location.taluk = sanitizeField(extractionData.location.taluk);
      extractionData.location.hobli = sanitizeField(extractionData.location.hobli);
      extractionData.location.village = sanitizeField(extractionData.location.village);
      extractionData.location.gramPanchayat = sanitizeField(extractionData.location.gramPanchayat);

      // If user selected state and extraction state was null/unknown, populate user state with high confidence
      if (options.selectedState && !extractionData.location.state?.value) {
        extractionData.location.state = {
          value: options.selectedState,
          confidence: 100,
          evidence: "Selected by user during document registration",
        };
      }
    }

    if (extractionData.parcelIdentifiers) {
      extractionData.parcelIdentifiers.surveyNumber = sanitizeField(extractionData.parcelIdentifiers.surveyNumber);
      extractionData.parcelIdentifiers.subDivision = sanitizeField(extractionData.parcelIdentifiers.subDivision);
      extractionData.parcelIdentifiers.khataNumber = sanitizeField(extractionData.parcelIdentifiers.khataNumber);
      extractionData.parcelIdentifiers.plotNumber = sanitizeField(extractionData.parcelIdentifiers.plotNumber);
      extractionData.parcelIdentifiers.pattaNumber = sanitizeField(extractionData.parcelIdentifiers.pattaNumber);
      extractionData.parcelIdentifiers.oldSurveyNumber = sanitizeField(extractionData.parcelIdentifiers.oldSurveyNumber);
    }

    if (options.selectedState && (!extractionData.documentClassification.state || extractionData.documentClassification.state === "unknown")) {
      extractionData.documentClassification.state = options.selectedState;
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
