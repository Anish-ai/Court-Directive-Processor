import { callLLM } from './llm';

export async function runTimelineAgent(
  extractedData: any,
  judgmentText: string
): Promise<any> {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `You are a legal timeline analyst. From the judgment text and extracted data below,
construct a comprehensive timeline of ALL dates and deadlines — both explicitly stated
and reasonably inferred from legal statutes.

Rules:
- If a deadline is stated as "within 30 days", calculate the actual date from the order date.
- If a limitation period is not stated but a statute applies, infer the standard limitation.
- Mark each timeline entry as "explicit" or "inferred".

Return STRICT JSON only. No markdown. No explanations.

Schema:
{
  "order_date": "YYYY-MM-DD",
  "timeline_entries": [
    {
      "timeline_id": "T1, T2...",
      "event": "string",
      "date": "YYYY-MM-DD | null",
      "duration_from_order": "string | null — e.g. 30 days, 6 weeks",
      "source": "explicit | inferred",
      "linked_direction_id": "D1, D2... | null",
      "applies_to": "petitioner | respondent | both | government | court",
      "is_deadline": true | false,
      "urgency": "immediate | short_term | medium_term | long_term",
      "confidence": "<integer 0-100>"
    }
  ],
  "critical_deadlines": [
    {
      "description": "string",
      "deadline_date": "YYYY-MM-DD | null",
      "days_remaining": "<integer | null — from today's date>",
      "consequence_of_missing": "string"
    }
  ]
}

Today's date: ${today}

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Judgment Text:
"""
${judgmentText}
"""`;

  return callLLM(prompt);
}
