import { callLLM } from './llm';

export async function runSynthesisAgent(
  extractedData: any,
  legalAnalysis: any,
  timeline: any,
  petitionerActions: any,
  respondentActions: any
): Promise<any> {
  const prompt = `You are the final quality-control and synthesis agent. You receive all outputs from
prior agents in the pipeline. Your job is to:

1. Cross-validate: Check if action items are consistent with the legal analysis and timelines.
2. Deduplicate: Remove or merge redundant actions across petitioner and respondent.
3. Calibrate confidence: Adjust confidence scores based on cross-referencing.
4. Produce the final unified action plan.

Return STRICT JSON only. No markdown. No explanations.

Schema:
{
  "case_summary": {
    "case_number": "string",
    "court": "string",
    "judge": "string",
    "date_of_order": "string",
    "outcome": "string",
    "legal_summary": "string"
  },
  "parties": {
    "petitioner": { "name": "string", "type": "string" },
    "respondent": { "name": "string", "type": "string" }
  },
  "petitioner_actions": [
    {
      "action_id": "string",
      "type": "string",
      "description": "string",
      "deadline": "string | null",
      "priority": "critical | high | medium | low",
      "responsible_department": "string | null",
      "confidence": "<integer 0-100>",
      "justification": "string"
    }
  ],
  "respondent_actions": [
    {
      "action_id": "string",
      "type": "string",
      "description": "string",
      "deadline": "string | null",
      "priority": "critical | high | medium | low",
      "responsible_department": "string | null",
      "confidence": "<integer 0-100>",
      "justification": "string",
      "compliance_risk_if_missed": "string | null"
    }
  ],
  "critical_deadlines": [
    {
      "description": "string",
      "date": "string",
      "applies_to": "petitioner | respondent | both",
      "days_remaining": "<integer | null>"
    }
  ],
  "appeal_recommendation": {
    "recommendation": "appeal_recommended | comply_recommended | seek_review",
    "reasoning": "string",
    "limitation_period": "string",
    "appeal_forum": "string | null"
  },
  "overall_confidence": "<integer 0-100>",
  "validation_notes": ["string — any discrepancies or warnings found during cross-validation"]
}

Extraction Agent Output:
${JSON.stringify(extractedData, null, 2)}

Legal Analyst Output:
${JSON.stringify(legalAnalysis, null, 2)}

Timeline Agent Output:
${JSON.stringify(timeline, null, 2)}

Petitioner Action Agent Output:
${JSON.stringify(petitionerActions, null, 2)}

Respondent Action Agent Output:
${JSON.stringify(respondentActions, null, 2)}`;

  return callLLM(prompt);
}
