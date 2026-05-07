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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ──────────────────────────────────────────────
    // STAGE 1: Ingestion Agent (code-only, no LLM)
    // ──────────────────────────────────────────────
    console.log('[Pipeline] Stage 1: Ingestion Agent...');
    const ingestion = await runIngestionAgent(buffer);

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

    return NextResponse.json({
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
