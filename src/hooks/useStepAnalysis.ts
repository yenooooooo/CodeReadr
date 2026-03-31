/**
 * 학습 단계별 on-demand Gemini 분석 훅
 * 3~6단계는 페이지 진입 시 필요한 분석을 실행하고,
 * 결과를 localStorage에 캐싱하여 재방문 시 재사용한다.
 * race condition 방지를 위해 cleanup 기반 stale 체크를 사용한다.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { callGeminiJSON } from '@/utils/gemini';

/** 분석 상태 */
export type AnalysisStatus = 'idle' | 'loading' | 'done' | 'error';

/** 훅 반환 타입 */
interface UseStepAnalysisReturn<T> {
  data: T | null;
  status: AnalysisStatus;
  error: string | null;
  retry: () => void;
}

/**
 * 학습 단계 데이터를 on-demand로 분석하고 캐싱하는 훅.
 * @param cacheKey - localStorage 캐시 키
 * @param prompt - Gemini에 보낼 프롬프트 (null이면 분석 스킵)
 */
export function useStepAnalysis<T>(
  cacheKey: string,
  prompt: string | null
): UseStepAnalysisReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  // retry 시 카운터를 증가시켜 useEffect 재실행을 유도
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!prompt) return;

    let cancelled = false; // 언마운트 또는 의존성 변경 시 stale 방지

    const run = async () => {
      // 캐시 확인
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          if (!cancelled) {
            setData(JSON.parse(cached) as T);
            setStatus('done');
          }
          return;
        }
      } catch {
        // 캐시 파싱 실패 시 무시
      }

      if (!cancelled) {
        setStatus('loading');
        setError(null);
      }

      try {
        const result = await callGeminiJSON<T>(prompt);
        if (cancelled) return; // stale 응답 무시
        localStorage.setItem(cacheKey, JSON.stringify(result));
        setData(result);
        setStatus('done');
      } catch (err) {
        if (cancelled) return;
        console.error(`Step 분석 실패 [${cacheKey}]:`, err);
        setError('AI 분석에 실패했어요. 잠시 후 다시 시도해주세요.');
        setStatus('error');
      }
    };

    run();

    // cleanup: 언마운트 또는 의존성 변경 시 이전 요청을 stale 처리
    return () => { cancelled = true; };
  }, [cacheKey, prompt, retryCount]);

  /** 재시도: 캐시 삭제 + retryCount 증가로 useEffect 재실행 */
  const retry = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setData(null);
    setStatus('idle');
    setError(null);
    setRetryCount((c) => c + 1);
  }, [cacheKey]);

  return { data, status, error, retry };
}
