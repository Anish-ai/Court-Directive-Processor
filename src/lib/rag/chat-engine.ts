/**
 * Central RAG Chat Engine — orchestrates query routing, retrieval, reranking,
 * and grounded response generation.
 */

import { classifyQuery, QueryType } from './query-router';
import { embedText } from './embeddings';
import { search, isIndexed } from './vector-store';
import { rerankResults, RankedResult } from './reranker';
import { searchLegalKB, LegalEntry } from './legal-kb';
import { callLLM } from '../agents/llm';

export type ResponseMode =
  | 'VERIFIED_OPERATIONAL'
  | 'SOURCE_GROUNDED_JUDGMENT'
  | 'GENERAL_LEGAL'
  | 'MIXED_ANALYTICAL'
  | 'INSUFFICIENT_EVIDENCE';

export interface ChatSource {
  page: number;
  text: string;
  score: number;
  chunk_id: string;
}

export interface ChatResponse {
  answer: string;
  alternative_answer?: string;
  mode: ResponseMode;
  confidence: number;
  sources: ChatSource[];
  query_type: QueryType;
  reasoning: string;
}

interface ChatContext {
  query: string;
  caseId?: string;
  extractedData?: any;
  synthesis?: any;
  conversationHistory?: { role: string; content: string }[];
}

/**
 * Main chat function — routes query, retrieves evidence, generates grounded response.
 */
export async function chat(ctx: ChatContext): Promise<ChatResponse> {
  const { query, caseId, extractedData, synthesis, conversationHistory } = ctx;

  // Step 1: Classify query
  const classification = await classifyQuery(query);
  console.log(`[ChatEngine] Query classified as ${classification.type} (${(classification.confidence * 100).toFixed(0)}%)`);

  // Step 2: Route to appropriate pipeline
  // If RAG index is unavailable, fall back to verified records
  const ragAvailable = caseId && (await import('./vector-store')).isIndexed(caseId);

  switch (classification.type) {
    case 'VERIFIED_RECORD':
      return handleVerifiedRecordQuery(query, extractedData, synthesis, classification.confidence, conversationHistory);

    case 'JUDGMENT_RAG':
      if (ragAvailable) {
        return handleJudgmentRAGQuery(query, caseId, classification.confidence, conversationHistory);
      }
      // Fallback: use verified records when RAG index not available
      console.log('[ChatEngine] RAG index unavailable, falling back to verified records.');
      return handleVerifiedRecordQuery(query, extractedData, synthesis, classification.confidence, conversationHistory);

    case 'GENERAL_LEGAL':
      return handleGeneralLegalQuery(query, classification.confidence, conversationHistory);

    case 'MIXED_REASONING':
      return handleMixedQuery(query, ragAvailable ? caseId : undefined, extractedData, synthesis, classification.confidence, conversationHistory);

    default:
      if (ragAvailable) {
        return handleJudgmentRAGQuery(query, caseId, classification.confidence, conversationHistory);
      }
      return handleVerifiedRecordQuery(query, extractedData, synthesis, classification.confidence, conversationHistory);
  }
}

// ─── PIPELINE 1: Verified Record Query ───

async function handleVerifiedRecordQuery(
  query: string,
  extractedData: any,
  synthesis: any,
  routerConfidence: number,
  history?: { role: string; content: string }[]
): Promise<ChatResponse> {
  if (!extractedData && !synthesis) {
    return {
      answer: 'No verified records are currently loaded. Please process a judgment PDF first, then ask your question.',
      mode: 'INSUFFICIENT_EVIDENCE',
      confidence: 0,
      sources: [],
      query_type: 'VERIFIED_RECORD',
      reasoning: 'No extracted data or synthesis available.',
    };
  }

  const contextStr = JSON.stringify({ extractedData, synthesis }, null, 2).substring(0, 8000);
  const historyStr = formatHistory(history);

  const prompt = `You are a precise legal operations assistant. Answer the user's question STRICTLY from the verified records provided below. Do NOT add information that is not in the records.

${historyStr}

VERIFIED RECORDS:
${contextStr}

USER QUESTION: "${query}"

Rules:
- Answer ONLY from the provided verified records
- Include specific details: dates, departments, action descriptions
- If the information is not in the records, say "This information is not available in the verified records."
- Be concise and operational
- Do NOT hallucinate or invent any data

Return JSON:
{
  "answer": "<your response>",
  "alternative_answer": "<a shorter or differently-worded interpretation of the same data, offering a different perspective>",
  "confidence": <0.0-1.0 based on how directly the records answer the question>,
  "field_sources": ["<which fields/sections the answer came from>"]
}`;

  try {
    const result = await callLLM(prompt);
    return {
      answer: result.answer || 'Unable to generate response from verified records.',
      alternative_answer: result.alternative_answer || undefined,
      mode: 'VERIFIED_OPERATIONAL',
      confidence: result.confidence || 0.8,
      sources: (result.field_sources || []).map((s: string) => ({
        page: 0,
        text: s,
        score: result.confidence || 0.8,
        chunk_id: 'verified_record',
      })),
      query_type: 'VERIFIED_RECORD',
      reasoning: 'Answer derived from verified pipeline output.',
    };
  } catch {
    return {
      answer: 'Failed to process your question against verified records. Please try again.',
      mode: 'INSUFFICIENT_EVIDENCE',
      confidence: 0,
      sources: [],
      query_type: 'VERIFIED_RECORD',
      reasoning: 'LLM call failed.',
    };
  }
}

// ─── PIPELINE 2: Judgment RAG Query ───

async function handleJudgmentRAGQuery(
  query: string,
  caseId: string | undefined,
  routerConfidence: number,
  history?: { role: string; content: string }[]
): Promise<ChatResponse> {
  if (!caseId || !isIndexed(caseId)) {
    return {
      answer: 'The judgment has not been indexed for retrieval yet. Please ensure the document has been processed through the pipeline.',
      mode: 'INSUFFICIENT_EVIDENCE',
      confidence: 0,
      sources: [],
      query_type: 'JUDGMENT_RAG',
      reasoning: 'No vector index found for this case.',
    };
  }

  // Retrieve
  const queryEmbedding = await embedText(query);
  const rawResults = search(caseId, queryEmbedding, 20);

  if (rawResults.length === 0) {
    return {
      answer: 'No relevant passages found in the judgment for your question.',
      mode: 'INSUFFICIENT_EVIDENCE',
      confidence: 0,
      sources: [],
      query_type: 'JUDGMENT_RAG',
      reasoning: 'Vector search returned no results.',
    };
  }

  // Rerank
  const reranked = await rerankResults(query, rawResults, 5);
  const historyStr = formatHistory(history);

  // Generate grounded response
  const evidenceStr = reranked.map((r, i) =>
    `[Source ${i + 1}] Page ${r.chunk.page_number}:\n"${r.chunk.text}"`
  ).join('\n\n');

  const prompt = `You are a legal document analyst. Answer the user's question ONLY using the evidence passages provided below. Do NOT add any information not present in the evidence.

${historyStr}

EVIDENCE FROM JUDGMENT:
${evidenceStr}

USER QUESTION: "${query}"

Rules:
- Ground every claim in a specific source (cite as [Source N])
- If evidence is insufficient, clearly state what is missing
- Be precise and factual
- Do NOT hallucinate legal obligations, dates, or parties

Return JSON:
{
  "answer": "<your grounded response with [Source N] citations>",
  "alternative_answer": "<a brief alternative reading or interpretation of the same evidence>",
  "confidence": <0.0-1.0>,
  "cited_sources": [<indices of sources used, e.g. 1, 3>]
}`;

  try {
    const result = await callLLM(prompt);
    const citedIndices: number[] = result.cited_sources || [];

    return {
      answer: result.answer || 'Unable to generate grounded response.',
      alternative_answer: result.alternative_answer || undefined,
      mode: 'SOURCE_GROUNDED_JUDGMENT',
      confidence: result.confidence || 0.7,
      sources: reranked.map((r, i) => ({
        page: r.chunk.page_number,
        text: r.chunk.text.substring(0, 200) + '...',
        score: r.score,
        chunk_id: r.chunk.chunk_id,
      })),
      query_type: 'JUDGMENT_RAG',
      reasoning: `Retrieved ${rawResults.length} chunks, reranked to top ${reranked.length}.`,
    };
  } catch {
    return {
      answer: 'Failed to generate response from judgment evidence. Please try again.',
      mode: 'INSUFFICIENT_EVIDENCE',
      confidence: 0,
      sources: [],
      query_type: 'JUDGMENT_RAG',
      reasoning: 'LLM generation failed.',
    };
  }
}

// ─── PIPELINE 3: General Legal Query ───

async function handleGeneralLegalQuery(
  query: string,
  routerConfidence: number,
  history?: { role: string; content: string }[]
): Promise<ChatResponse> {
  // Check static KB first
  const kbResults = searchLegalKB(query);
  const historyStr = formatHistory(history);

  let kbContext = '';
  if (kbResults.length > 0) {
    kbContext = `\nREFERENCE KNOWLEDGE:\n${kbResults.map(e => `- ${e.term}: ${e.definition}`).join('\n\n')}`;
  }

  const prompt = `You are an Indian legal knowledge expert. Provide a clear, accurate explanation for the user's legal question. This is a GENERAL LEGAL question, not about a specific case.
${historyStr}
${kbContext}

USER QUESTION: "${query}"

Rules:
- Provide accurate legal information based on Indian law
- Cite relevant statutes, articles, or acts
- Keep explanations concise but thorough
- Include practical implications
- Do NOT provide case-specific advice
- Clearly state this is general legal knowledge

Return JSON:
{
  "answer": "<your explanation>",
  "alternative_answer": "<a concise alternative explanation using different framing or emphasis>",
  "confidence": <0.0-1.0>,
  "statutes_referenced": ["<relevant statutes/articles>"]
}`;

  try {
    const result = await callLLM(prompt);
    return {
      answer: result.answer || 'Unable to generate legal explanation.',
      alternative_answer: result.alternative_answer || undefined,
      mode: 'GENERAL_LEGAL',
      confidence: result.confidence || 0.75,
      sources: [
        ...kbResults.map(e => ({
          page: 0,
          text: `${e.term}: ${e.definition.substring(0, 150)}...`,
          score: 0.9,
          chunk_id: `kb_${e.term.toLowerCase().replace(/\s+/g, '_')}`,
        })),
        ...(result.statutes_referenced || []).map((s: string) => ({
          page: 0,
          text: s,
          score: 0.8,
          chunk_id: `statute_ref`,
        })),
      ],
      query_type: 'GENERAL_LEGAL',
      reasoning: kbResults.length > 0
        ? `Matched ${kbResults.length} entries in legal knowledge base.`
        : 'Generated from general legal knowledge.',
    };
  } catch {
    return {
      answer: 'Failed to generate legal explanation. Please try again.',
      mode: 'INSUFFICIENT_EVIDENCE',
      confidence: 0,
      sources: [],
      query_type: 'GENERAL_LEGAL',
      reasoning: 'LLM generation failed.',
    };
  }
}

// ─── PIPELINE 4: Mixed Reasoning Query ───

async function handleMixedQuery(
  query: string,
  caseId: string | undefined,
  extractedData: any,
  synthesis: any,
  routerConfidence: number,
  history?: { role: string; content: string }[]
): Promise<ChatResponse> {
  // Gather evidence from both sources
  let ragEvidence = '';
  let ragSources: ChatSource[] = [];

  if (caseId && isIndexed(caseId)) {
    const queryEmbedding = await embedText(query);
    const rawResults = search(caseId, queryEmbedding, 15);
    const reranked = await rerankResults(query, rawResults, 3);

    ragEvidence = reranked.map((r, i) =>
      `[Judgment Source ${i + 1}] Page ${r.chunk.page_number}: "${r.chunk.text.substring(0, 400)}"`
    ).join('\n\n');

    ragSources = reranked.map(r => ({
      page: r.chunk.page_number,
      text: r.chunk.text.substring(0, 200) + '...',
      score: r.score,
      chunk_id: r.chunk.chunk_id,
    }));
  }

  const verifiedContext = (extractedData || synthesis)
    ? JSON.stringify({ extractedData, synthesis }, null, 2).substring(0, 4000)
    : '';

  const historyStr = formatHistory(history);

  const prompt = `You are a senior legal analyst. The user's question requires BOTH factual retrieval and analytical reasoning. Provide a comprehensive answer that clearly distinguishes FACTS from ANALYSIS.

${historyStr}

${ragEvidence ? `EVIDENCE FROM JUDGMENT:\n${ragEvidence}\n` : ''}
${verifiedContext ? `VERIFIED RECORDS:\n${verifiedContext}\n` : ''}

USER QUESTION: "${query}"

Rules:
- Clearly separate facts (from evidence) from analysis (your reasoning)
- Use labels like "FACT:" and "ANALYSIS:" in your response
- If evidence conflicts, highlight the conflict
- Provide actionable recommendations where appropriate
- Do NOT fabricate legal obligations

Return JSON:
{
  "answer": "<your mixed analysis with FACT/ANALYSIS labels>",
  "confidence": <0.0-1.0>,
  "facts_used": <number of facts cited>,
  "analysis_provided": true
}`;

  try {
    const result = await callLLM(prompt);
    return {
      answer: result.answer || 'Unable to generate mixed analysis.',
      alternative_answer: result.alternative_answer || undefined,
      mode: 'MIXED_ANALYTICAL',
      confidence: result.confidence || 0.7,
      sources: ragSources,
      query_type: 'MIXED_REASONING',
      reasoning: `Combined ${ragSources.length} judgment sources with verified records for analysis.`,
    };
  } catch {
    return {
      answer: 'Failed to generate analytical response. Please try again.',
      mode: 'INSUFFICIENT_EVIDENCE',
      confidence: 0,
      sources: [],
      query_type: 'MIXED_REASONING',
      reasoning: 'LLM generation failed.',
    };
  }
}

// ─── Utility ───

function formatHistory(history?: { role: string; content: string }[]): string {
  if (!history || history.length === 0) return '';
  const recent = history.slice(-6); // Keep last 3 exchanges
  return 'CONVERSATION HISTORY:\n' + recent.map(m => `${m.role}: ${m.content}`).join('\n') + '\n';
}
