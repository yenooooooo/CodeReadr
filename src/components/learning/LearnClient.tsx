/**
 * 학습 메인 클라이언트 컴포넌트
 * localStorage에서 프로젝트 데이터 + 진행률을 불러와
 * 6단계 로드맵 + 프로젝트 요약 + 전체 진행률을 표시한다.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStorage } from '@/hooks/useStorage';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { STORAGE_KEYS, LEARNING_STEPS } from '@/constants';
import { EmptyState } from '@/components/ui/LoadingSkeleton';
import type { StoredProject } from '@/types/project';
import type { LearningStep } from '@/types/learning';

/** 학습 메인 클라이언트 */
export function LearnClient() {
  const { load } = useStorage();
  const { progress, isStepCompleted } = useLearningProgress();
  const [project, setProject] = useState<StoredProject | null>(null);

  // 마운트 시 localStorage에서 프로젝트 데이터 로드
  useEffect(() => {
    const data = load<StoredProject>(STORAGE_KEYS.PROJECT);
    setProject(data);
  }, [load]);

  if (!project) {
    return <EmptyState title="프로젝트 없음" description="먼저 파일을 업로드해주세요." />;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* 프로젝트 요약 헤더 */}
      <header className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">학습 로드맵</h1>
          <span className="text-[10px] font-mono text-mint border border-mint/20 bg-mint/10 px-2 py-0.5">
            PROGRESS: {progress.totalProgress}%
          </span>
        </div>
        <p className="text-on-surface-variant text-sm">{project.structure.summary}</p>
        {/* 전체 진행률 바 */}
        <div className="mt-4 w-full bg-surface-container-high h-1.5">
          <div className="h-full bg-mint transition-all duration-500" style={{ width: `${progress.totalProgress}%` }} />
        </div>
        <div className="flex gap-2 mt-3">
          <span className="text-[10px] font-mono bg-mint/10 text-mint px-2 py-0.5 border border-mint/20">
            FILES: {project.files.length}
          </span>
          <span className="text-[10px] font-mono bg-mint/10 text-mint px-2 py-0.5 border border-mint/20">
            TECH: {project.techStack.length}
          </span>
        </div>
      </header>

      {/* 6단계 로드맵 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEARNING_STEPS.map((step) => {
          const completed = isStepCompleted(step.step as LearningStep);
          return (
            <Link
              key={step.step}
              href={`/learn/step/${step.step}`}
              className={`bg-surface-container-low border p-6 transition-all group ${
                completed
                  ? 'border-mint/40 bg-mint/5'
                  : 'border-outline-variant/30 hover:border-mint/30 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono text-mint font-bold uppercase">
                  Step {String(step.step).padStart(2, '0')}
                </span>
                <span className={`text-[9px] font-mono px-2 py-0.5 ${
                  completed
                    ? 'bg-mint/20 text-mint'
                    : 'bg-secondary-container text-on-surface-variant'
                }`}>
                  {completed ? 'COMPLETE' : step.difficulty}
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface mb-2 group-hover:text-mint transition-colors">
                {step.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{step.description}</p>
              <div className="mt-4 w-full bg-surface-container-high h-1">
                <div className={`h-full transition-all duration-500 ${completed ? 'bg-mint w-full' : 'bg-outline-variant w-0'}`} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
