import { callLLM } from './llm';

export async function runLegalAnalystAgent(
  extractedData: any,
  judgmentText: string
): Promise<any> {
  const prompt = `You are a senior legal analyst specializing in Indian administrative and constitutional law.
You are given structured data extracted from a court judgment along with the original text.

Your task is to produce a deep legal analysis. Focus on:
1. What are the OBLIGATIONS created by this judgment?
2. Who bears each obligation (petitioner, respondent, or a third party)?
3. Is there a basis for appeal? What are the legal grounds?
4. What is the limitation period for appeal (statutory default if not stated)?
5. What are the compliance risks if directives are not followed?

Return STRICT JSON only. No markdown. No explanations.

Schema:
{
  "obligations": [
    {
      "obligation_id": "O1, O2...",
      "linked_direction_id": "D1, D2... — from extraction",
      "obligated_party": "petitioner | respondent | government_department | other",
      "nature": "financial | procedural | administrative | remedial | prohibitory",
      "description": "string",
      "is_conditional": true | false,
      "condition": "string | null"
    }
  ],
  "appeal_analysis": {
    "is_appealable": true | false,
    "appeal_forum": "string | null — e.g. Supreme Court, Division Bench",
    "legal_grounds": ["string"],
    "limitation_period": "string | null — e.g. 90 days from date of order",
    "recommendation": "appeal_recommended | comply_recommended | seek_review | unclear",
    "reasoning": "string — 2-3 sentences justifying the recommendation"
  },
  "compliance_risks": [
    {
      "risk": "string",
      "severity": "high | medium | low",
      "consequence": "string — e.g. contempt of court, penalty"
    }
  ],
  "legal_summary": "string — 3-5 sentence plain-English summary of the judgment's impact"
}

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Original Judgment Text:
"""
${judgmentText}
"""`;

  return callLLM(prompt);
}
