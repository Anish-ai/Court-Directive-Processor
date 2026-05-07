import { GoogleGenAI } from '@google/genai';

let _ai: InstanceType<typeof GoogleGenAI> | null = null;

function getClient(): InstanceType<typeof GoogleGenAI> {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Shared LLM call utility for all agents.
 * Retries with exponential backoff on transient errors (503, 429).
 * Falls back to alternate models if primary is unavailable.
 */
export async function callLLM(prompt: string, model?: string): Promise<any> {
  const ai = getClient();
  const modelsToTry = model ? [model] : MODELS;

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error('LLM returned an empty response.');
        }

        return JSON.parse(text);
      } catch (err: any) {
        lastError = err;
        const msg = err.message || '';
        const isRetryable = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('overloaded');
        const isModelGone = msg.includes('404') || msg.includes('no longer available') || msg.includes('NOT_FOUND');

        if (isModelGone) {
          console.warn(`[LLM] Model "${currentModel}" unavailable, trying next model...`);
          break; // skip to next model
        }

        if (isRetryable && attempt < MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`[LLM] ${currentModel} returned transient error (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${Math.round(delay)}ms...`);
          await sleep(delay);
          continue;
        }

        if (!isRetryable) {
          throw err; // non-retryable error, bail immediately
        }
      }
    }
  }

  throw lastError || new Error('All LLM models failed.');
}
