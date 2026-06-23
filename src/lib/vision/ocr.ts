import { readFileSync } from "node:fs";
import { ImageAnnotatorClient } from "@google-cloud/vision";

type ServiceAccountCredentials = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

let client: ImageAnnotatorClient | null = null;

function parseCredentialsJson(raw: string): ServiceAccountCredentials {
  // UTF-8 BOM (common when JSON is saved from some editors on Windows/Mac)
  const cleaned = raw.replace(/^\uFEFF/, "").trim();
  return JSON.parse(cleaned) as ServiceAccountCredentials;
}

function loadCredentials(): ServiceAccountCredentials | null {
  const inline = process.env.GOOGLE_CREDENTIALS_JSON;
  if (inline) {
    return parseCredentialsJson(inline);
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) return null;

  const raw = readFileSync(credentialsPath, "utf8");
  return parseCredentialsJson(raw);
}

function getVisionClient(): ImageAnnotatorClient {
  if (client) return client;

  const credentials = loadCredentials();
  if (!credentials?.private_key || !credentials.client_email) {
    throw new Error(
      "Credenciales GCP inválidas. Verifica secrets/gcp-vision.json (type: service_account)."
    );
  }

  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT_ID ?? credentials.project_id;

  client = new ImageAnnotatorClient({
    credentials,
    projectId,
  });
  return client;
}

const BIB_CANDIDATE_REGEX = /\b(\d{1,5})\b/g;

export function extractBibCandidates(text: string): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];
  const regex = new RegExp(BIB_CANDIDATE_REGEX);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const value = match[1];
    if (!seen.has(value)) {
      seen.add(value);
      candidates.push(value);
    }
  }

  return candidates;
}

export function filterBibsByRange(
  candidates: string[],
  bibMin: number,
  bibMax: number
): number[] {
  const inRange = new Set<number>();

  for (const candidate of candidates) {
    const num = Number.parseInt(candidate, 10);
    if (!Number.isNaN(num) && num >= bibMin && num <= bibMax) {
      inRange.add(num);
    }
  }

  return Array.from(inRange).sort((a, b) => a - b);
}

export function preferReferenceDigitLength(
  bibs: number[],
  referenceBibs: number[]
): number[] {
  if (referenceBibs.length === 0 || bibs.length <= 1) {
    return bibs;
  }

  const lengths = referenceBibs.map((bib) => String(bib).length);
  const preferredLength = lengths.sort(
    (a, b) =>
      lengths.filter((len) => len === b).length -
      lengths.filter((len) => len === a).length
  )[0];

  const matchingLength = bibs.filter(
    (bib) => String(bib).length === preferredLength
  );

  return matchingLength.length > 0 ? matchingLength : bibs;
}

export async function detectTextFromImage(
  imageBuffer: Buffer
): Promise<string> {
  const visionClient = getVisionClient();
  const [result] = await visionClient.textDetection({
    image: { content: imageBuffer },
  });

  return result.fullTextAnnotation?.text ?? "";
}

export async function detectBibNumbers(
  imageBuffer: Buffer,
  options: {
    bibMin: number;
    bibMax: number;
    referenceImageBuffer?: Buffer | null;
  }
): Promise<number[]> {
  const text = await detectTextFromImage(imageBuffer);
  const candidates = extractBibCandidates(text);
  let bibs = filterBibsByRange(candidates, options.bibMin, options.bibMax);

  if (options.referenceImageBuffer) {
    const refText = await detectTextFromImage(options.referenceImageBuffer);
    const refCandidates = extractBibCandidates(refText);
    const refBibs = filterBibsByRange(
      refCandidates,
      options.bibMin,
      options.bibMax
    );
    bibs = preferReferenceDigitLength(bibs, refBibs);
  }

  return bibs;
}
