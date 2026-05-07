import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120; // Allow up to 2 minutes for full pipeline

import { runIngestionAgent } from '@/lib/agents/ingestion';
import { runExtractionAgent } from '@/lib/agents/extraction';
import { runLegalAnalystAgent } from '@/lib/agents/legal-analyst';
import { runTimelineAgent } from '@/lib/agents/timeline';
import { runPetitionerActionAgent } from '@/lib/agents/petitioner';
import { runRespondentActionAgent } from '@/lib/agents/respondent';
import { runSynthesisAgent } from '@/lib/agents/synthesis';
import { chunkDocument } from '@/lib/rag/chunker';
import { embedBatch } from '@/lib/rag/embeddings';
import { addDocument } from '@/lib/rag/vector-store';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const pdfType = (formData.get('pdfType') as string) || 'text';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ──────────────────────────────────────────────
    // STAGE 1: Ingestion Agent (code-only, no LLM)
    // ──────────────────────────────────────────────
    console.log(`[Pipeline] Stage 1: Ingestion Agent (mode: ${pdfType})...`);
    const ingestion = await runIngestionAgent(buffer, pdfType as 'text' | 'scanned');

    // ──────────────────────────────────────────────
    // STAGE 2: Extraction Agent (LLM)
    // ──────────────────────────────────────────────
    console.log('[Pipeline] Stage 2: Extraction Agent...');
    const extraction = await runExtractionAgent(ingestion.full_text);

    // ──────────────────────────────────────────────
    // STAGE 3 & 4: Legal Analyst + Timeline (parallel)
    // ──────────────────────────────────────────────
    console.log('[Pipeline] Stage 3+4: Legal Analyst + Timeline Agents (parallel)...');
    const [legalAnalysis, timeline] = await Promise.all([
      runLegalAnalystAgent(extraction, ingestion.full_text),
      runTimelineAgent(extraction, ingestion.full_text),
    ]);

    // ──────────────────────────────────────────────
    // STAGE 5 & 6: Petitioner + Respondent Actions (parallel)
    // ──────────────────────────────────────────────
    console.log('[Pipeline] Stage 5+6: Petitioner + Respondent Action Agents (parallel)...');
    const [petitionerActions, respondentActions] = await Promise.all([
      runPetitionerActionAgent(extraction, legalAnalysis, timeline),
      runRespondentActionAgent(extraction, legalAnalysis, timeline),
    ]);

    // ──────────────────────────────────────────────
    // STAGE 7: Synthesis Agent (LLM)
    // ──────────────────────────────────────────────
    console.log('[Pipeline] Stage 7: Synthesis Agent...');
    const synthesis = await runSynthesisAgent(
      extraction,
      legalAnalysis,
      timeline,
      petitionerActions,
      respondentActions
    );

    console.log('[Pipeline] ✅ All agents completed successfully.');

    // ──────────────────────────────────────────────
    // STAGE 8: RAG Indexing (chunk + embed + store)
    // ──────────────────────────────────────────────
    const caseId = extraction?.case_details?.case_number
      ? extraction.case_details.case_number.replace(/[^a-zA-Z0-9]/g, '_')
      : `case_${Date.now()}`;

    try {
      console.log(`[Pipeline] Stage 8: RAG Indexing (caseId: ${caseId})...`);
      const chunks = chunkDocument(ingestion.full_text, ingestion.page_map, caseId);
      const chunkTexts = chunks.map(c => c.text);
      const embeddings = await embedBatch(chunkTexts);
      addDocument(caseId, chunks, embeddings);
      console.log(`[Pipeline] ✅ RAG index ready: ${chunks.length} chunks indexed.`);
    } catch (ragErr: any) {
      console.warn(`[Pipeline] ⚠️ RAG indexing failed (non-fatal): ${ragErr.message}`);
    }

    return NextResponse.json({
      caseId,
      extraction,
      legalAnalysis,
      timeline,
      petitionerActions,
      respondentActions,
      synthesis,
    });

  } catch (error: any) {
    console.error('[Pipeline] ❌ Error:', error.message);
    return NextResponse.json({
      error: 'Pipeline processing failed',
      details: error.message,
    }, { status: 500 });
  }
}
