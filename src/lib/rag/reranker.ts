/**
 * LLM-based reranker for RAG results.
 * Takes top semantic results and reranks by relevance to the specific question.
 */

import { callLLM } from '../agents/llm';
import { SearchResult } from './vector-store';

export interface RankedResult extends SearchResult {
  rerank_score: number;
  keyword_boost: number;
}

/**
 * Rerank search results using LLM relevance scoring + keyword boost.
 */
export async function rerankResults(
  query: string,
  results: SearchResult[],
  topK: number = 5
): Promise<RankedResult[]> {
  if (results.length === 0) return [];

  // Take top 15 for reranking (balance cost vs quality)
  const candidates = results.slice(0, 15);

  // Step 1: Keyword overlap boost
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
  const withKeywordBoost: RankedResult[] = candidates.map(r => {
    const chunkLower = r.chunk.text.toLowerCase();
    const matches = queryTerms.filter(t => chunkLower.includes(t)).length;
    const keyword_boost = queryTerms.length > 0 ? matches / queryTerms.length : 0;
    return {
      ...r,
      rerank_score: 0,
      keyword_boost,
    };
  });

  // Step 2: LLM-based relevance scoring
  try {
    const snippets = withKeywordBoost.map((r, i) => 
      `[${i}] Page ${r.chunk.page_number}: "${r.chunk.text.substring(0, 300)}..."`
    ).join('\n\n');

    const prompt = `You are a legal document relevance assessor. Given a user question and document excerpts, rate each excerpt's relevance to the question on a scale of 0-100.

Question: "${query}"

Excerpts:
${snippets}

Return JSON only:
{
  "scores": [<score for [0]>, <score for [1]>, ...]
}

Rules:
- 90-100: Directly answers the question
- 60-89: Contains relevant information
- 30-59: Tangentially related
- 0-29: Not relevant
- Return ONLY the JSON object`;

    const result = await callLLM(prompt);
    const scores = result.scores || [];

    for (let i = 0; i < withKeywordBoost.length && i < scores.length; i++) {
      withKeywordBoost[i].rerank_score = (scores[i] || 0) / 100;
    }
  } catch (err) {
    console.warn('[Reranker] LLM reranking failed, using semantic scores only.');
    // Fallback: use semantic similarity as rerank score
    for (const r of withKeywordBoost) {
      r.rerank_score = r.score;
    }
  }

  // Step 3: Combine scores (60% rerank, 25% semantic, 15% keyword)
  for (const r of withKeywordBoost) {
    r.score = (r.rerank_score * 0.60) + (r.score * 0.25) + (r.keyword_boost * 0.15);
  }

  // Sort by combined score
  withKeywordBoost.sort((a, b) => b.score - a.score);
  return withKeywordBoost.slice(0, topK);
}
