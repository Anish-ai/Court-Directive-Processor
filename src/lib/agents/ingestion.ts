import { PDFParse } from 'pdf-parse';

export interface IngestionResult {
  full_text: string;
  page_map: Record<number, string>;
  page_count: number;
  is_scanned: boolean;
}

export async function runIngestionAgent(buffer: Buffer): Promise<IngestionResult> {
  const parser = new PDFParse({ data: buffer });

  const info = await parser.getInfo({ parsePageInfo: true });
  const pageCount = info.total || 1;

  // Extract text page by page for the page map
  const pageMap: Record<number, string> = {};
  let fullText = '';

  for (let i = 1; i <= pageCount; i++) {
    try {
      const pageResult = await parser.getText({ partial: [i] });
      pageMap[i] = pageResult.text || '';
      fullText += pageResult.text || '';
    } catch {
      pageMap[i] = '';
    }
  }

  await parser.destroy();

  // If total text is very short, it's likely a scanned document
  const isScanned = fullText.trim().length < 50;

  if (isScanned) {
    throw new Error(
      'The PDF appears to be scanned/image-based with no extractable text. OCR is not yet supported.'
    );
  }

  return {
    full_text: fullText,
    page_map: pageMap,
    page_count: pageCount,
    is_scanned: isScanned,
  };
}
