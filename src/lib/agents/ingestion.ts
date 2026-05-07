import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

export interface IngestionResult {
  full_text: string;
  page_map: Record<number, string>;
  page_count: number;
  is_scanned: boolean;
  extraction_method: 'text-parse' | 'gemini-vision';
}

let _ai: InstanceType<typeof GoogleGenAI> | null = null;

function getVisionClient(): InstanceType<typeof GoogleGenAI> {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

/**
 * Gemini Vision OCR fallback for scanned/image-based PDFs.
 * Sends the entire PDF as inline data and asks Gemini to extract text page-by-page.
 */
async function extractWithGeminiVision(buffer: Buffer): Promise<{
  full_text: string;
  page_map: Record<number, string>;
  page_count: number;
}> {
  const ai = getVisionClient();
  const base64Data = buffer.toString('base64');

  console.log('[Ingestion] Using Gemini Vision OCR for scanned PDF...');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          {
            text: `You are a legal document OCR engine. Extract ALL text from this court judgment PDF.

Instructions:
1. Extract every word, paragraph, heading, and legal text from every page.
2. Preserve the original structure (paragraphs, numbered lists, sections).
3. Return the output as a JSON object with this exact schema:

{
  "page_count": <total number of pages>,
  "pages": {
    "1": "<full text of page 1>",
    "2": "<full text of page 2>",
    ...
  }
}

Rules:
- Do NOT summarize or paraphrase. Extract the EXACT text.
- Include headers, footers, case numbers, dates, and all legal content.
- If a page has no readable text, return an empty string for that page.
- Return ONLY valid JSON. No markdown. No explanations.`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini Vision returned an empty response.');
  }

  const parsed = JSON.parse(text);
  const pageCount = parsed.page_count || Object.keys(parsed.pages || {}).length || 1;
  const pageMap: Record<number, string> = {};
  let fullText = '';

  for (const [pageNum, pageText] of Object.entries(parsed.pages || {})) {
    const num = parseInt(pageNum, 10);
    const content = (pageText as string) || '';
    pageMap[num] = content;
    fullText += content + '\n\n';
  }

  if (fullText.trim().length < 20) {
    throw new Error(
      'Gemini Vision could not extract meaningful text from this PDF. The document may be corrupted or contain only images without text.'
    );
  }

  console.log(`[Ingestion] Gemini Vision extracted ${fullText.length} chars across ${pageCount} pages.`);

  return { full_text: fullText.trim(), page_map: pageMap, page_count: pageCount };
}

/**
 * Hybrid Ingestion Agent:
 * - mode 'text': Uses pdf-parse (fast, no API cost)
 * - mode 'scanned': Uses Gemini Vision OCR directly
 */
export async function runIngestionAgent(
  buffer: Buffer,
  mode: 'text' | 'scanned' = 'text'
): Promise<IngestionResult> {

  // ── SCANNED MODE: Go straight to Gemini Vision ──
  if (mode === 'scanned') {
    console.log('[Ingestion] User selected SCANNED mode — using Gemini Vision OCR...');
    const visionResult = await extractWithGeminiVision(buffer);
    return {
      full_text: visionResult.full_text,
      page_map: visionResult.page_map,
      page_count: visionResult.page_count,
      is_scanned: true,
      extraction_method: 'gemini-vision',
    };
  }

  // ── TEXT MODE: Use pdf-parse ──
  let textFullText = '';
  let textPageMap: Record<number, string> = {};
  let textPageCount = 1;

  try {
    const parser = new PDFParse({ data: buffer });
    const info = await parser.getInfo({ parsePageInfo: true });
    textPageCount = info.total || 1;

    for (let i = 1; i <= textPageCount; i++) {
      try {
        const pageResult = await parser.getText({ partial: [i] });
        textPageMap[i] = pageResult.text || '';
        textFullText += pageResult.text || '';
      } catch {
        textPageMap[i] = '';
      }
    }

    await parser.destroy();

    // Quality check — if text mode yields garbage, auto-fallback to Vision
    const cleaned = textFullText.trim();
    const words = cleaned.split(/\s+/).filter(w => w.length > 2 && /[a-zA-Z]/.test(w));
    const avgWordLen = words.length > 0 ? words.reduce((s, w) => s + w.length, 0) / words.length : 0;
    const qualityOk = cleaned.length >= 200 && words.length >= 30 && avgWordLen >= 2 && avgWordLen <= 20;

    if (qualityOk) {
      console.log(`[Ingestion] Text-parse successful: ${cleaned.length} chars, ${words.length} words.`);
      return {
        full_text: textFullText,
        page_map: textPageMap,
        page_count: textPageCount,
        is_scanned: false,
        extraction_method: 'text-parse',
      };
    }

    // Text mode failed quality check — auto-fallback
    console.log(`[Ingestion] Text mode quality check failed (${words.length} words). Auto-falling back to Gemini Vision...`);
  } catch (err) {
    console.warn('[Ingestion] pdf-parse crashed. Auto-falling back to Gemini Vision...');
  }

  const visionResult = await extractWithGeminiVision(buffer);
  return {
    full_text: visionResult.full_text,
    page_map: visionResult.page_map,
    page_count: visionResult.page_count,
    is_scanned: true,
    extraction_method: 'gemini-vision',
  };
}

