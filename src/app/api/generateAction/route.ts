import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const extractedData = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const prompt = `Generate an action plan based on the following extracted court judgment details.
The model MUST return STRICT JSON format only. No explanations. No markdown formatting. If unknown, return null.

Schema:
{
  "actions": [
    {
      "type": "compliance | appeal | review",
      "description": "",
      "deadline": "",
      "responsible_department": "",
      "priority": "high | medium | low",
      "confidence": <integer between 0 and 100>,
      "justification": ""
    }
  ]
}

Extracted Data:
${JSON.stringify(extractedData, null, 2)}
`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error("Failed to receive a valid response from Gemini Action generation");
    }

    const jsonResult = JSON.parse(resultText);

    return NextResponse.json(jsonResult);

  } catch (error: any) {
    console.error('API /generateAction Error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to generate action plan', 
      details: error.response?.data?.error?.message || error.message 
    }, { status: 500 });
  }
}
