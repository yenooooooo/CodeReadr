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
 * @returns AI 응답 텍스트
 * @throws API 키 미설정 또는 요청 실패 시 에러
 */
export async function callGemini(
  prompt: string,
  options: GeminiRequestOptions = {}
): Promise<string> {
  // API 키가 설정되어 있는지 확인
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    throw new Error(
      'Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
    );
  }

  const {
    model = GEMINI_CONFIG.DEFAULT_MODEL,
    temperature = GEMINI_CONFIG.ANALYSIS_TEMPERATURE,
    maxOutputTokens = GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
  } = options;

  // Gemini API 엔드포인트로 POST 요청
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    }),
  });

  // HTTP 에러 처리
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API 에러:', response.status, errorBody);
    throw new Error(`Gemini API 요청 실패 (${response.status})`);
  }

  // 응답 JSON 파싱 (비정상 응답 시 안전하게 에러 처리)
  let data: GeminiResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error('Gemini API 응답을 파싱할 수 없습니다.');
  }

  // 응답에서 텍스트 추출
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API에서 빈 응답을 받았습니다.');
  }

  return text;
}

/**
 * Gemini API에 프롬프트를 보내고 JSON 응답을 파싱하여 반환한다.
 * AI 응답에서 JSON 블록을 추출하고 파싱한다.
 * @param prompt - AI에게 보낼 프롬프트 (JSON 응답을 요청하는 내용 포함)
 * @param options - API 요청 옵션
 * @returns 파싱된 JSON 객체
 * @throws JSON 파싱 실패 시 에러
 */
export async function callGeminiJSON<T>(
  prompt: string,
  options: GeminiRequestOptions = {}
): Promise<T> {
  // 토큰 제한으로 잘리지 않도록 충분한 출력 토큰 확보
  const jsonOptions = {
    ...options,
    maxOutputTokens: options.maxOutputTokens ?? 16384,
  };
  const text = await callGemini(prompt, jsonOptions);

  // AI 응답에서 JSON 부분만 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                    text.match(/```\s*([\s\S]*?)\s*```/);

  let jsonString = jsonMatch ? jsonMatch[1] : text;
  jsonString = jsonString.trim();

  // 1차 시도: 그대로 파싱
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    // 2차 시도: 잘린 JSON 복구 — 닫히지 않은 괄호/대괄호 보정
    const repaired = repairTruncatedJSON(jsonString);
    try {
      return JSON.parse(repaired) as T;
    } catch {
      console.error('JSON 파싱 실패. 원본 응답:', text.slice(0, 500));
      throw new Error('AI 응답을 JSON으로 변환하는 데 실패했습니다.');
    }
  }
}

