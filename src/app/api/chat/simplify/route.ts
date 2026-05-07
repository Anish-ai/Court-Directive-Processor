import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/agents/llm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/chat/simplify
 * Takes a legal response and returns a plain-English version.
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
    }

    const prompt = `You are a legal language simplifier for government officials who are NOT lawyers.

Rewrite the following legal response in simple, everyday English that anyone can understand.

Rules:
- Replace ALL legal jargon with plain language (e.g. "petitioner" → "the person who filed the case")
- Keep the same meaning and facts — do NOT change any dates, names, or obligations
- Use short sentences
- Add brief parenthetical explanations for unavoidable legal terms
- Keep the response roughly the same length
- Do NOT add new information

ORIGINAL TEXT:
"""
${text}
"""

Return JSON:
{
  "simplified": "<the simplified version>"
}`;

    const result = await callLLM(prompt);
    return NextResponse.json({ simplified: result.simplified || text });
  } catch (error: any) {
    console.error('[Simplify API] Error:', error.message);
    return NextResponse.json({ simplified: 'Could not simplify. Please try again.' }, { status: 500 });
  }
}
