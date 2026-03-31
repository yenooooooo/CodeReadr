/**
 * Gemini API 클라이언트
 * Google Gemini API와 통신하는 핵심 유틸리티.
 * 429/503 에러 시 자동 재시도(exponential backoff)를 지원한다.
 */

import { GEMINI_CONFIG } from '@/constants';
import { repairTruncatedJSON } from './jsonRepair';

/** Gemini API 키 */
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

/** Gemini API 요청 옵션 */
interface GeminiRequestOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/** Gemini API 응답 구조 */
interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}

/** 최대 재시도 횟수 */
const MAX_RETRIES = 3;

/**
 * 지정된 밀리초만큼 대기한다.
 * @param ms - 대기 시간 (밀리초)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gemini API에 프롬프트를 보내고 텍스트 응답을 받는다.
 * 429(rate limit) / 503(overloaded) 시 자동으로 대기 후 재시도한다.
 * @param prompt - 프롬프트 문자열
 * @param options - API 요청 옵션
 * @param jsonMode - JSON 모드 여부
 */
async function fetchGemini(
  prompt: string,
  options: GeminiRequestOptions = {},
  jsonMode: boolean = false
): Promise<string> {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  const {
    model = GEMINI_CONFIG.DEFAULT_MODEL,
    temperature = GEMINI_CONFIG.ANALYSIS_TEMPERATURE,
    maxOutputTokens = GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
  } = options;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const generationConfig: Record<string, unknown> = { temperature, maxOutputTokens };
  if (jsonMode) generationConfig.responseMimeType = 'application/json';

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  });

  // 재시도 루프 (429/503 시 대기 후 재시도)
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    // 성공
    if (response.ok) {
      let data: GeminiResponse;
      try { data = await response.json(); }
      catch { throw new Error('Gemini API 응답을 파싱할 수 없습니다.'); }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini API에서 빈 응답을 받았습니다.');
      return text;
    }

    // 429 또는 503 → 재시도 가능
    if ((response.status === 429 || response.status === 503) && attempt < MAX_RETRIES) {
      // 에러 바디에서 retryDelay 추출 시도
      const errorBody = await response.text();
      const delayMatch = errorBody.match(/retryDelay.*?(\d+)/);
      const waitSec = delayMatch ? parseInt(delayMatch[1], 10) : 15 * (attempt + 1);
      console.warn(`Gemini ${response.status}: ${waitSec}초 후 재시도 (${attempt + 1}/${MAX_RETRIES})`);
      await sleep(waitSec * 1000);
      continue;
    }

    // 그 외 에러 → 즉시 실패
    const errorBody = await response.text();
    console.error('Gemini API 에러:', response.status, errorBody);
    throw new Error(`Gemini API 요청 실패 (${response.status})`);
  }

  throw new Error('Gemini API 재시도 횟수를 초과했습니다.');
}

/** 텍스트 응답 받기 (공개 API) */
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
