import { callLLM } from './llm';

export async function runRespondentActionAgent(
  extractedData: any,
  legalAnalysis: any,
  timeline: any
): Promise<any> {
  const prompt = `You are an action planning specialist for the RESPONDENT party in a court case.
Given the legal analysis, timeline data, and extracted judgment information,
generate a concrete, prioritized action plan specifically for the respondent.

Consider:
- What must the respondent do to comply with the court's order?
- Are there penalties or contempt risks for non-compliance?
- Should the respondent consider filing an appeal? What is the limitation period?
- What departments need to be notified or mobilized?
- Are there financial implications (compensation, costs, refunds)?

Return STRICT JSON only. No markdown. No explanations.

Schema:
{
  "party": "respondent",
  "party_name": "string",
  "actions": [
    {
      "action_id": "RA1, RA2...",
      "type": "compliance | appeal | review | financial | departmental_coordination | administrative",
      "description": "string",
      "deadline": "YYYY-MM-DD | string | null",
      "linked_obligation_id": "O1, O2... | null",
      "linked_timeline_id": "T1, T2... | null",
      "priority": "critical | high | medium | low",
      "responsible_department": "string | null",
      "estimated_effort": "string",
      "confidence": "<integer 0-100>",
      "justification": "string",
      "compliance_risk_if_missed": "string | null"
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
