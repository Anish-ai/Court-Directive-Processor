/**
 * In-memory vector store for RAG retrieval.
 * Stores chunks + embeddings per case. Supports similarity search with metadata filtering.
 */

import { Chunk } from './chunker';
import { cosineSimilarity } from './embeddings';

interface IndexedChunk {
  chunk: Chunk;
  embedding: number[];
}

interface CaseIndex {
  chunks: IndexedChunk[];
  indexedAt: Date;
}

// In-memory store — keyed by caseId
const store: Map<string, CaseIndex> = new Map();

export interface SearchResult {
  chunk: Chunk;
  score: number;
}

/**
 * Index a document's chunks and embeddings.
 */
export function addDocument(caseId: string, chunks: Chunk[], embeddings: number[][]): void {
  if (chunks.length !== embeddings.length) {
    throw new Error(`Chunk count (${chunks.length}) does not match embedding count (${embeddings.length}).`);
  }

  const indexed: IndexedChunk[] = chunks.map((chunk, i) => ({
    chunk,
    embedding: embeddings[i],
  }));

  store.set(caseId, { chunks: indexed, indexedAt: new Date() });
  console.log(`[VectorStore] Indexed ${chunks.length} chunks for case ${caseId}.`);
}

/**
 * Semantic search over indexed chunks.
 */
export function search(
  caseId: string,
  queryEmbedding: number[],
  topK: number = 20,
  filters?: { pageNumber?: number }
): SearchResult[] {
  const index = store.get(caseId);
  if (!index) {
    console.warn(`[VectorStore] No index found for case ${caseId}.`);
    return [];
  }

  let candidates = index.chunks;

  // Apply metadata filters
  if (filters?.pageNumber) {
    candidates = candidates.filter(c => c.chunk.page_number === filters.pageNumber);
  }

  // Compute similarities
  const scored: SearchResult[] = candidates.map(c => ({
    chunk: c.chunk,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));

  // Sort by score descending, return top K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Check if a case has been indexed.
 */
export function isIndexed(caseId: string): boolean {
  return store.has(caseId);
}

/**
 * Get all indexed case IDs.
 */
export function getIndexedCases(): string[] {
  return Array.from(store.keys());
}

/**
 * Remove a case index.
 */
export function removeDocument(caseId: string): void {
  store.delete(caseId);
}
