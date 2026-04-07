/**
 * Gemini API 클라이언트
 * 서버사이드 프록시(/api/gemini)를 통해 Gemini API를 호출한다.
 * API 키는 서버에서만 사용되어 클라이언트에 노출되지 않는다.
 */

import { GEMINI_CONFIG } from '@/constants';
import { repairTruncatedJSON } from './jsonRepair';

/** Gemini API 요청 옵션 */
interface GeminiRequestOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * 서버 프록시를 통해 Gemini API에 프롬프트를 보내고 텍스트 응답을 받는다.
 */
async function fetchGemini(
  prompt: string,
  options: GeminiRequestOptions = {},
  jsonMode: boolean = false
): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      jsonMode,
      options: {
        model: options.model ?? GEMINI_CONFIG.DEFAULT_MODEL,
        temperature: options.temperature ?? GEMINI_CONFIG.ANALYSIS_TEMPERATURE,
        maxOutputTokens: options.maxOutputTokens ?? GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API 요청 실패 (${response.status})`);
  }

  return data.text;
}

/** 텍스트 응답 받기 */
export async function callGemini(
  prompt: string,
  options: GeminiRequestOptions = {}
): Promise<string> {
  return fetchGemini(prompt, options, false);
}

/** JSON 모드로 호출하여 파싱된 객체 반환 */
export async function callGeminiJSON<T>(
  prompt: string,
  options: GeminiRequestOptions = {}
): Promise<T> {
  const jsonOptions = { ...options, maxOutputTokens: options.maxOutputTokens ?? 16384 };
  const text = await fetchGemini(prompt, jsonOptions, true);

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonString = (jsonMatch ? jsonMatch[1] : text).trim();

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    try {
      return JSON.parse(repairTruncatedJSON(jsonString)) as T;
    } catch {
      console.error('JSON 파싱 실패:', text.slice(0, 500));
      throw new Error('AI 응답을 JSON으로 변환하는 데 실패했습니다.');
    }
  }
}
