/**
 * Gemini API 클라이언트
 * Google Gemini API와 통신하는 핵심 유틸리티.
 * 모든 AI 호출은 이 파일을 통해 이루어진다.
 */

import { GEMINI_CONFIG } from '@/constants';
import { repairTruncatedJSON } from './jsonRepair';

/** Gemini API 키 (환경 변수에서 읽기) */
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

/** Gemini API 요청 옵션 */
interface GeminiRequestOptions {
  /** 사용할 모델 (기본: gemini-2.5-flash) */
  model?: string;
  /** temperature 값 (0~1, 낮을수록 일관된 응답) */
  temperature?: number;
  /** 최대 출력 토큰 수 */
  maxOutputTokens?: number;
}

/** Gemini API 응답 구조 */
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

/**
 * Gemini API에 프롬프트를 보내고 텍스트 응답을 받는다.
 * @param prompt - AI에게 보낼 프롬프트 문자열
 * @param options - API 요청 옵션 (모델, temperature 등)
 * @param jsonMode - true면 responseMimeType을 application/json으로 설정
 * @returns AI 응답 텍스트
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

  // generationConfig에 JSON 모드 추가
  const generationConfig: Record<string, unknown> = {
    temperature,
    maxOutputTokens,
  };
  if (jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API 에러:', response.status, errorBody);
    throw new Error(`Gemini API 요청 실패 (${response.status})`);
  }

  let data: GeminiResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error('Gemini API 응답을 파싱할 수 없습니다.');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API에서 빈 응답을 받았습니다.');
  }

  return text;
}

/**
 * Gemini API에 프롬프트를 보내고 텍스트 응답을 받는다 (공개 API).
 */
export async function callGemini(
  prompt: string,
  options: GeminiRequestOptions = {}
): Promise<string> {
  return fetchGemini(prompt, options, false);
}

/**
 * Gemini API에 JSON 모드로 호출하여 파싱된 객체를 반환한다.
 * responseMimeType: application/json으로 순수 JSON 출력을 강제한다.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  options: GeminiRequestOptions = {}
): Promise<T> {
  const jsonOptions = {
    ...options,
    maxOutputTokens: options.maxOutputTokens ?? 16384,
  };

  const text = await fetchGemini(prompt, jsonOptions, true);

  // JSON 모드에서도 간혹 ```json 래퍼가 붙을 수 있으므로 제거
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonString = (jsonMatch ? jsonMatch[1] : text).trim();

  // 1차: 그대로 파싱
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    // 2차: 잘린 JSON 복구
    try {
      return JSON.parse(repairTruncatedJSON(jsonString)) as T;
    } catch {
      console.error('JSON 파싱 실패. 원본:', text.slice(0, 500));
      throw new Error('AI 응답을 JSON으로 변환하는 데 실패했습니다.');
    }
  }
}
