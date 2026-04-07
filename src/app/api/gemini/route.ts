/**
 * Gemini API 프록시 라우트
 * API 키를 서버에서만 사용하여 클라이언트 노출을 방지한다.
 * 모델 폴백, 429/503 재시도를 서버에서 처리한다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_CONFIG } from '@/constants';

/** 서버 전용 API 키 (NEXT_PUBLIC_ 아님!) */
const API_KEY = process.env.GEMINI_API_KEY;

const MAX_RETRIES = 3;

/** IP 기반 rate limit (분당 30회) */
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000; // 1분

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}

export async function POST(request: NextRequest) {
  // Rate limit 체크
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API 키가 서버에 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  // 요청 파싱
  let prompt: string;
  let jsonMode: boolean;
  let options: { model?: string; temperature?: number; maxOutputTokens?: number };
  try {
    const body = await request.json();
    prompt = body.prompt;
    jsonMode = body.jsonMode ?? false;
    options = body.options ?? {};
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt가 필요합니다.' }, { status: 400 });
    }
    // 프롬프트 크기 제한 (100KB)
    if (prompt.length > 100_000) {
      return NextResponse.json({ error: '프롬프트가 너무 깁니다.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const {
    model = GEMINI_CONFIG.DEFAULT_MODEL,
    temperature = GEMINI_CONFIG.ANALYSIS_TEMPERATURE,
    maxOutputTokens = GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
  } = options;

  const generationConfig: Record<string, unknown> = { temperature, maxOutputTokens };
  if (jsonMode) generationConfig.responseMimeType = 'application/json';

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  });

  // 모델 폴백 + 재시도
  const modelsToTry = [model, ...GEMINI_CONFIG.FALLBACK_MODELS.filter((m) => m !== model)];

  for (const currentModel of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${API_KEY}`;
    let shouldTryNextModel = false;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      if (response.ok) {
        let data: GeminiResponse;
        try { data = await response.json(); }
        catch { return NextResponse.json({ error: 'Gemini 응답 파싱 실패' }, { status: 502 }); }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return NextResponse.json({ error: 'Gemini 빈 응답' }, { status: 502 });
        return NextResponse.json({ text });
      }

      if (response.status === 429) {
        const errorBody = await response.text();
        if (errorBody.includes('per_day') || errorBody.includes('PerDay')) {
          shouldTryNextModel = true;
          break;
        }
        if (attempt < MAX_RETRIES) {
          const delayMatch = errorBody.match(/retryDelay.*?(\d+)/);
          const waitSec = delayMatch ? Math.min(parseInt(delayMatch[1], 10), 30) : 10 * (attempt + 1);
          await sleep(waitSec * 1000);
          continue;
        }
        shouldTryNextModel = true;
        break;
      }

      if (response.status === 503 && attempt < MAX_RETRIES) {
        await sleep(10 * (attempt + 1) * 1000);
        continue;
      }

      return NextResponse.json(
        { error: `Gemini API 오류 (${response.status})` },
        { status: 502 }
      );
    }

    if (!shouldTryNextModel) break;
  }

  return NextResponse.json(
    { error: '모든 모델의 할당량이 소진되었습니다.' },
    { status: 429 }
  );
}
