/**
 * 학습 단계 클라이언트 — 단계별 라우터
 * stepId에 따라 적절한 학습 컴포넌트를 렌더링한다.
 */

'use client';

import { useEffect, useState } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { STORAGE_KEYS } from '@/constants';
import type { StoredProject } from '@/types/project';
import { Step1ProjectScan } from './Step1ProjectScan';
import { Step2TechStack } from './Step2TechStack';
import { Step3CodeWalkthrough } from './Step3CodeWalkthrough';
import { Step4Quiz } from './Step4Quiz';
import { Step5CodeReview } from './Step5CodeReview';
import { Step6PromptMaster } from './Step6PromptMaster';

/** StepClient props */
interface StepClientProps {
  /** URL에서 받은 단계 ID 문자열 */
  stepId: string;
}

/** 학습 단계 클라이언트 */
export function StepClient({ stepId }: StepClientProps) {
  const { load } = useStorage();
  const [project, setProject] = useState<StoredProject | null>(null);

  // 마운트 시 localStorage에서 프로젝트 데이터 로드
  useEffect(() => {
    const data = load<StoredProject>(STORAGE_KEYS.PROJECT);
    setProject(data);
  }, [load]);

  // 데이터 로딩 중
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-outline font-mono text-sm animate-pulse">
          Loading project data...
        </p>
      </div>
    );
  }

  // 단계별 컴포넌트 분기
  const step = parseInt(stepId, 10);
  switch (step) {
    case 1:
      return <Step1ProjectScan project={project} />;
    case 2:
      return <Step2TechStack project={project} />;
    case 3:
      return <Step3CodeWalkthrough project={project} />;
    case 4:
      return <Step4Quiz project={project} />;
    case 5:
      return <Step5CodeReview project={project} />;
    case 6:
      return <Step6PromptMaster project={project} />;
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-outline font-mono text-sm mb-2">
              Step {stepId} — Coming Soon
            </p>
            <p className="text-on-surface-variant text-xs">
              이 단계는 아직 준비 중입니다.
            </p>
          </div>
        </div>
      );
  }
}
