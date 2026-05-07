import { callLLM } from './llm';

export async function runExtractionAgent(judgmentText: string): Promise<any> {
  const prompt = `You are a precision legal document parser. Your ONLY task is to extract factual,
structural information from the court judgment text below. Do NOT interpret,
infer, or add any information that is not explicitly stated in the text.

Extract the following in STRICT JSON format. Return JSON only. No markdown. No explanations.
If a field cannot be determined from the text, return null for that field.

Schema:
{
  "case_details": {
    "case_number": "string | null",
    "case_type": "string | null — e.g. Writ Petition, Civil Appeal, Criminal Appeal, SLP, PIL, etc.",
    "court": "string | null — full name of the court",
    "bench": "string | null — e.g. Division Bench, Single Bench, Full Bench",
    "judge": "string | null — name(s) of presiding judge(s)",
    "filed_under": "string | null — statute/article under which case was filed"
  },
  "date_of_order": "string | null — in YYYY-MM-DD format if possible",
  "parties": {
    "petitioner": {
      "name": "string | null",
      "type": "individual | organization | government_department | other | null",
      "represented_by": "string | null — advocate name"
    },
    "respondent": {
      "name": "string | null",
      "type": "individual | organization | government_department | other | null",
      "represented_by": "string | null — advocate name"
    },
    "additional_parties": [
      {
        "name": "string",
        "role": "intervenor | impleaded | amicus_curiae | other",
        "represented_by": "string | null"
      }
    ]
  },
  "key_directions": [
    {
      "direction_id": "D1, D2, D3...",
      "text": "string — exact or near-exact quote from judgment",
      "directed_at": "petitioner | respondent | both | court | government | other",
      "page_reference": "string | null",
      "is_mandatory": true | false,
      "confidence": "<integer 0-100>"
    }
  ],
  "cited_statutes": [
    {
      "name": "string — e.g. Article 226, Section 34 of Arbitration Act",
      "context": "string — brief context of why it was cited"
    }
  ],
  "relief_granted": "string | null — summary of what relief the court granted",
  "case_outcome": "allowed | dismissed | partially_allowed | remanded | disposed | other | null"
}

Judgment Text:
"""
${judgmentText}
"""`;

  return callLLM(prompt);
}
