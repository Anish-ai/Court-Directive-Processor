/**
 * Embedding generation using Gemini text-embedding-004.
 * Provides batch embedding and cosine similarity computation.
 */

import { GoogleGenAI } from '@google/genai';

let _ai: InstanceType<typeof GoogleGenAI> | null = null;

function getClient(): InstanceType<typeof GoogleGenAI> {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured.');
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

const EMBEDDING_MODEL = 'gemini-embedding-001';

/**
 * Generate embedding for a single text string.
 */
export async function embedText(text: string): Promise<number[]> {
  const ai = getClient();
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
  });
  return result.embeddings?.[0]?.values || [];
}

/**
 * Generate embeddings for a batch of texts.
 * Processes in batches of 50 to stay within API limits.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const ai = getClient();
  const batchSize = 50;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    // Process each text individually (API may not support batch natively)
    const batchResults = await Promise.all(
      batch.map(async (text) => {
        const result = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: text,
        });
        return result.embeddings?.[0]?.values || [];
      })
    );

    allEmbeddings.push(...batchResults);
    
    if (i + batchSize < texts.length) {
      // Small delay between batches to avoid rate limits
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`[Embeddings] Generated ${allEmbeddings.length} embeddings.`);
  return allEmbeddings;
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
