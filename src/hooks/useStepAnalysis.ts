/**
 * 학습 단계별 on-demand Gemini 분석 훅
 * 3~6단계는 페이지 진입 시 필요한 분석을 실행하고,
 * 결과를 localStorage에 캐싱하여 재방문 시 재사용한다.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { callGeminiJSON } from '@/utils/gemini';

/** 분석 상태 */
export type AnalysisStatus = 'idle' | 'loading' | 'done' | 'error';

/** 훅 반환 타입 */
interface UseStepAnalysisReturn<T> {
  /** 분석 결과 데이터 */
  data: T | null;
  /** 현재 상태 */
  status: AnalysisStatus;
  /** 에러 메시지 */
  error: string | null;
  /** 수동 재분석 실행 */
  retry: () => void;
}

/**
 * 학습 단계 데이터를 on-demand로 분석하고 캐싱하는 훅.
 * @param cacheKey - localStorage 캐시 키
 * @param prompt - Gemini에 보낼 프롬프트 (null이면 분석 스킵)
 * @returns 분석 결과, 상태, 에러, 재시도 함수
 */
export function useStepAnalysis<T>(
  cacheKey: string,
  prompt: string | null
): UseStepAnalysisReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  /** 분석 실행 (캐시 확인 → 없으면 API 호출) */
  const runAnalysis = useCallback(async () => {
    if (!prompt) return;

    // 캐시 확인
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached) as T);
        setStatus('done');
        return;
      }
    } catch {
      // 캐시 파싱 실패 시 무시하고 새로 분석
    }

    // Gemini API 호출
    setStatus('loading');
    setError(null);

    try {
      const result = await callGeminiJSON<T>(prompt);
      // 결과 캐싱
      localStorage.setItem(cacheKey, JSON.stringify(result));
      setData(result);
      setStatus('done');
    } catch (err) {
      console.error(`Step 분석 실패 [${cacheKey}]:`, err);
      setError('AI 분석에 실패했어요. 잠시 후 다시 시도해주세요.');
      setStatus('error');
    }
  }, [cacheKey, prompt]);

  // 마운트 시 자동 실행
  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  /** 재시도: 캐시 삭제 후 다시 분석 */
  const retry = useCallback(() => {
    localStorage.removeItem(cacheKey);
    runAnalysis();
  }, [cacheKey, runAnalysis]);

  return { data, status, error, retry };
}
