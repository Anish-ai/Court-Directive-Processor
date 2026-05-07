/**
 * Paragraph-aware document chunker for legal PDFs.
 * Splits text into semantically meaningful chunks with page metadata.
 */

export interface Chunk {
  chunk_id: string;
  text: string;
  page_number: number;
  section_heading: string | null;
  char_start: number;
  char_end: number;
  word_count: number;
}

const MIN_CHUNK_WORDS = 40;
const MAX_CHUNK_WORDS = 400;
const HEADING_PATTERN = /^(?:\d+[\.\)]\s*|[A-Z][A-Z\s]{3,}$|(?:SECTION|CHAPTER|ORDER|ARTICLE|CLAUSE|DIRECTION)\s)/;

/**
 * Detects which page a character offset falls on, using the page_map.
 */
function getPageForOffset(offset: number, pageOffsets: { page: number; start: number; end: number }[]): number {
  for (const po of pageOffsets) {
    if (offset >= po.start && offset < po.end) return po.page;
  }
  return pageOffsets.length > 0 ? pageOffsets[pageOffsets.length - 1].page : 1;
}

/**
 * Chunks a legal document into paragraph-aware segments with page metadata.
 */
export function chunkDocument(
  fullText: string,
  pageMap: Record<number, string>,
  caseId: string
): Chunk[] {
  // Build page offset index
  const pageOffsets: { page: number; start: number; end: number }[] = [];
  let runningOffset = 0;
  const pageNums = Object.keys(pageMap).map(Number).sort((a, b) => a - b);

  for (const pageNum of pageNums) {
    const pageText = pageMap[pageNum] || '';
    pageOffsets.push({
      page: pageNum,
      start: runningOffset,
      end: runningOffset + pageText.length,
    });
    runningOffset += pageText.length;
  }

  // Split by double-newline (paragraph boundaries) or single newline followed by uppercase
  const rawParagraphs = fullText.split(/\n\s*\n/);
  const chunks: Chunk[] = [];
  let currentChunkText = '';
  let currentChunkStart = 0;
  let currentHeading: string | null = null;
  let charCursor = 0;
  let chunkIndex = 0;

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      charCursor += para.length + 2; // +2 for \n\n
      continue;
    }

    // Detect section headings
    const firstLine = trimmed.split('\n')[0].trim();
    if (HEADING_PATTERN.test(firstLine) && firstLine.length < 120) {
      currentHeading = firstLine;
    }

    const paraWordCount = trimmed.split(/\s+/).length;
    const currentWordCount = currentChunkText.split(/\s+/).filter(Boolean).length;

    // If adding this paragraph exceeds max, flush current chunk
    if (currentWordCount + paraWordCount > MAX_CHUNK_WORDS && currentWordCount >= MIN_CHUNK_WORDS) {
      const pageNum = getPageForOffset(currentChunkStart, pageOffsets);
      chunks.push({
        chunk_id: `${caseId}_chunk_${chunkIndex++}`,
        text: currentChunkText.trim(),
        page_number: pageNum,
        section_heading: currentHeading,
        char_start: currentChunkStart,
        char_end: charCursor,
        word_count: currentWordCount,
      });
      currentChunkText = '';
      currentChunkStart = charCursor;
    }

    if (!currentChunkText) {
      currentChunkStart = charCursor;
    }
    currentChunkText += (currentChunkText ? '\n\n' : '') + trimmed;
    charCursor += para.length + 2;
  }

  // Flush remaining text
  if (currentChunkText.trim()) {
    const wordCount = currentChunkText.split(/\s+/).filter(Boolean).length;
    const pageNum = getPageForOffset(currentChunkStart, pageOffsets);
    chunks.push({
      chunk_id: `${caseId}_chunk_${chunkIndex++}`,
      text: currentChunkText.trim(),
      page_number: pageNum,
      section_heading: currentHeading,
      char_start: currentChunkStart,
      char_end: charCursor,
      word_count: wordCount,
    });
  }

  console.log(`[Chunker] Created ${chunks.length} chunks from ${fullText.length} chars.`);
  return chunks;
}
