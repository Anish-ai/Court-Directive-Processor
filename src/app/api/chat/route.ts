import { NextResponse } from 'next/server';
import { chat } from '@/lib/rag/chat-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, caseId, extractedData, synthesis, conversationHistory } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const response = await chat({
      query,
      caseId,
      extractedData,
      synthesis,
      conversationHistory,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Chat API] Error:', error.message);
    return NextResponse.json({
      answer: 'An error occurred while processing your question. Please try again.',
      mode: 'INSUFFICIENT_EVIDENCE',
      confidence: 0,
      sources: [],
      query_type: 'JUDGMENT_RAG',
      reasoning: error.message,
    }, { status: 500 });
  }
}
