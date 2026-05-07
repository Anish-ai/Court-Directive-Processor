import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF using PDFParse class
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No readable text found in the PDF. Scanned images are not completely supported without OCR.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const prompt = `You are a highly analytical legal assistant. Analyze the following court judgment text and extract the required information in STRICT JSON format.
The model MUST return JSON only. No explanations. No markdown. If unknown, return null.

Schema:
{
  "case_details": {
    "case_number": "",
    "court": "",
    "judge": ""
  },
  "date_of_order": "",
  "parties": {
    "petitioner": "",
    "respondent": ""
  },
  "key_directions": [
    {
      "text": "",
      "page_reference": "",
      "confidence": <integer between 0 and 100>
    }
  ],
  "timelines": [
    {
      "event": "",
      "date_or_duration": "",
      "confidence": <integer between 0 and 100>
    }
  ]
}

Judgment Text:
"""
${text}
"""
`;

    // Make request via GoogleGenAI SDK to Gemini 3.1 Pro
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
      throw new Error("Failed to receive a valid response from Gemini");
    }

    const jsonResult = JSON.parse(resultText);

    return NextResponse.json(jsonResult);

  } catch (error: any) {
    console.error('API /extract Error:', error.response?.data || error.message);
    return NextResponse.json({
      error: 'Failed to process judgment',
      details: error.response?.data?.error?.message || error.message
    }, { status: 500 });
  }
}
