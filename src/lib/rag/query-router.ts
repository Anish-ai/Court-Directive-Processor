/**
 * Query Router — classifies user queries into 4 categories using LLM.
 */

import { callLLM } from '../agents/llm';

export type QueryType = 
  | 'VERIFIED_RECORD'
  | 'JUDGMENT_RAG'
  | 'GENERAL_LEGAL'
  | 'MIXED_REASONING';

export interface QueryClassification {
  type: QueryType;
  confidence: number;
  reasoning: string;
}

/**
 * Classify a user query into one of 4 routing categories.
 */
export async function classifyQuery(query: string): Promise<QueryClassification> {
  const prompt = `You are a legal query classifier for a court judgment processing system. Classify the user query into exactly ONE of these 4 categories:

1. VERIFIED_RECORD — Questions about approved action plans, assigned departments, verified deadlines, or approved compliance actions.
   Examples: "What is the compliance deadline?", "Which department is responsible?", "What actions were approved?"

2. JUDGMENT_RAG — Questions requiring retrieval from the original judgment PDF text.
   Examples: "What did the court order?", "What is written in paragraph 12?", "What directions were issued?"

3. GENERAL_LEGAL — General legal/procedural/conceptual questions not specific to any case.
   Examples: "What is contempt of court?", "What is a writ petition?", "What happens if appeal deadline expires?"

4. MIXED_REASONING — Questions requiring both retrieval from the judgment AND analytical reasoning.
   Examples: "Why is this judgment risky?", "Should we prioritize appeal?", "What are the implications?"

User Query: "${query}"

Return JSON only:
{
  "type": "<VERIFIED_RECORD | JUDGMENT_RAG | GENERAL_LEGAL | MIXED_REASONING>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<brief 1-line explanation>"
}`;

  try {
    const result = await callLLM(prompt);
    return {
      type: result.type || 'JUDGMENT_RAG',
      confidence: result.confidence || 0.7,
      reasoning: result.reasoning || '',
    };
  } catch {
    // Fallback: keyword-based classification
    return classifyByKeywords(query);
  }
}

/**
 * Fast keyword-based fallback classifier.
 */
function classifyByKeywords(query: string): QueryClassification {
  const q = query.toLowerCase();

  // General legal patterns
  const generalPatterns = [
    'what is', 'what are', 'define', 'explain', 'meaning of',
    'difference between', 'types of', 'how does', 'what happens when',
    'in general', 'typically', 'usually', 'in law',
  ];
  if (generalPatterns.some(p => q.includes(p)) && !q.includes('this case') && !q.includes('this judgment')) {
    return { type: 'GENERAL_LEGAL', confidence: 0.7, reasoning: 'Keyword match: general legal query' };
  }

  // Verified record patterns
  const verifiedPatterns = [
    'approved', 'verified', 'assigned', 'department responsible',
    'action plan', 'compliance deadline', 'what was decided',
  ];
  if (verifiedPatterns.some(p => q.includes(p))) {
    return { type: 'VERIFIED_RECORD', confidence: 0.7, reasoning: 'Keyword match: verified record query' };
  }

  // Mixed reasoning patterns
  const mixedPatterns = [
    'why', 'should we', 'implications', 'risk', 'recommend',
    'prioritize', 'impact', 'consequence', 'analyze',
  ];
  if (mixedPatterns.some(p => q.includes(p))) {
    return { type: 'MIXED_REASONING', confidence: 0.65, reasoning: 'Keyword match: mixed reasoning query' };
  }

  // Default to judgment RAG
  return { type: 'JUDGMENT_RAG', confidence: 0.6, reasoning: 'Default: judgment-specific query' };
}
