/**
 * 학습 진행률 관리 훅
 * 각 단계 완료 상태를 localStorage에 저장하고,
 * 전체 진행률을 계산하여 반환한다.
 */

'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '@/constants';
import type { LearningProgress, LearningStep } from '@/types/learning';

/** 초기 진행률 상태 */
const INITIAL_PROGRESS: LearningProgress = {
  currentStep: 1,
  completedTopics: [],
  quizScores: [],
  totalProgress: 0,
};

/** 훅 반환 타입 */
interface UseLearningProgressReturn {
  /** 현재 진행률 데이터 */
  progress: LearningProgress;
  /** 특정 단계를 완료 처리 */
  completeStep: (step: LearningStep) => void;
  /** 퀴즈 점수 기록 */
  recordQuizScore: (quizId: string, score: number) => void;
  /** 특정 단계가 완료되었는지 확인 */
  isStepCompleted: (step: LearningStep) => boolean;
  /** 진행률 초기화 */
  resetProgress: () => void;
}

/**
 * 학습 진행률을 관리하는 커스텀 훅.
 * @returns 진행률 데이터 + 관리 함수들
 */
export function useLearningProgress(): UseLearningProgressReturn {
  const [progress, setProgress, removeProgress] = useLocalStorage<LearningProgress>(
    STORAGE_KEYS.PROGRESS,
    INITIAL_PROGRESS
  );

  /** 특정 단계를 완료 처리하고 전체 진행률 업데이트 */
  const completeStep = useCallback((step: LearningStep) => {
    setProgress((prev) => {
      const topicId = `step-${step}`;
      // 이미 완료된 단계면 스킵
      if (prev.completedTopics.includes(topicId)) return prev;

      const newCompleted = [...prev.completedTopics, topicId];
      // 전체 진행률: 완료된 단계 수 / 전체 6단계 * 100
      const newProgress = Math.round((newCompleted.length / 6) * 100);
      // 다음 단계로 currentStep 업데이트
      const nextStep = Math.min(6, step + 1) as LearningStep;

      return {
        ...prev,
        completedTopics: newCompleted,
        totalProgress: newProgress,
        currentStep: prev.currentStep < nextStep ? nextStep : prev.currentStep,
      };
    });
  }, [setProgress]);

  /** 퀴즈 점수 기록 */
  const recordQuizScore = useCallback((quizId: string, score: number) => {
    setProgress((prev) => ({
      ...prev,
      quizScores: [
        ...prev.quizScores,
        { quizId, score, attemptedAt: new Date().toISOString() },
      ],
    }));
  }, [setProgress]);

  /** 특정 단계가 완료되었는지 확인 */
  const isStepCompleted = useCallback((step: LearningStep) => {
    return progress.completedTopics.includes(`step-${step}`);
  }, [progress.completedTopics]);

  /** 진행률 초기화 */
  const resetProgress = useCallback(() => {
    removeProgress();
  }, [removeProgress]);

  return { progress, completeStep, recordQuizScore, isStepCompleted, resetProgress };
}
