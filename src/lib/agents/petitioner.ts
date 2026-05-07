import { callLLM } from './llm';

export async function runPetitionerActionAgent(
  extractedData: any,
  legalAnalysis: any,
  timeline: any
): Promise<any> {
  const prompt = `You are an action planning specialist for the PETITIONER party in a court case.
Given the legal analysis, timeline data, and extracted judgment information,
generate a concrete, prioritized action plan specifically for the petitioner.

Consider:
- What must the petitioner do to enforce or benefit from this order?
- Are there deadlines the petitioner must act on (e.g., filing execution petitions)?
- Does the petitioner need to monitor respondent compliance?
- Should the petitioner consider any protective measures?

Return STRICT JSON only. No markdown. No explanations.

Schema:
{
  "party": "petitioner",
  "party_name": "string",
  "actions": [
    {
      "action_id": "PA1, PA2...",
      "type": "compliance | enforcement | monitoring | appeal | protective | administrative",
      "description": "string",
      "deadline": "YYYY-MM-DD | string | null",
      "linked_obligation_id": "O1, O2... | null",
      "linked_timeline_id": "T1, T2... | null",
      "priority": "critical | high | medium | low",
      "responsible_department": "string | null",
      "estimated_effort": "string — e.g. 1-2 days, requires legal counsel",
      "confidence": "<integer 0-100>",
      "justification": "string"
    }
  ]
}

Legal Analysis:
${JSON.stringify(legalAnalysis, null, 2)}

Timeline Data:
${JSON.stringify(timeline, null, 2)}

Extracted Data:
${JSON.stringify(extractedData, null, 2)}`;

  return callLLM(prompt);
}
