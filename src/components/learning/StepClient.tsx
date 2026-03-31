/**
 * 학습 단계 클라이언트 — 단계별 라우터 + 진행률 관리
 * stepId에 따라 적절한 학습 컴포넌트를 렌더링하고,
 * 하단에 "이해 완료" 버튼을 공통으로 표시한다.
 */

'use client';

import { useEffect, useState } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { STORAGE_KEYS } from '@/constants';
import type { StoredProject } from '@/types/project';
import type { LearningStep } from '@/types/learning';
import { StepCompleteBar } from './StepCompleteBar';
import { Step1ProjectScan } from './Step1ProjectScan';
import { Step2TechStack } from './Step2TechStack';
import { Step3CodeWalkthrough } from './Step3CodeWalkthrough';
import { Step4Quiz } from './Step4Quiz';
import { Step5CodeReview } from './Step5CodeReview';
import { Step6PromptMaster } from './Step6PromptMaster';

/** StepClient props */
interface StepClientProps {
  stepId: string;
}

/** 학습 단계 클라이언트 */
export function StepClient({ stepId }: StepClientProps) {
  const { load } = useStorage();
  const { completeStep, isStepCompleted } = useLearningProgress();
  const [project, setProject] = useState<StoredProject | null>(null);

  useEffect(() => {
    const data = load<StoredProject>(STORAGE_KEYS.PROJECT);
    setProject(data);
  }, [load]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-outline font-mono text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const step = parseInt(stepId, 10) as LearningStep;
  const completed = isStepCompleted(step);

  /** 단계별 컴포넌트 렌더링 */
  const renderStep = () => {
    switch (step) {
      case 1: return <Step1ProjectScan project={project} />;
      case 2: return <Step2TechStack project={project} />;
      case 3: return <Step3CodeWalkthrough project={project} />;
      case 4: return <Step4Quiz project={project} />;
      case 5: return <Step5CodeReview project={project} />;
      case 6: return <Step6PromptMaster project={project} />;
      default: return (
        <div className="flex items-center justify-center h-full">
          <p className="text-outline font-mono text-sm">Step {stepId} — Coming Soon</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Step 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        {renderStep()}
      </div>
      {/* 하단: 이해 완료 바 (1~6단계만) */}
      {step >= 1 && step <= 6 && (
        <StepCompleteBar
          step={step}
          isCompleted={completed}
          onComplete={() => completeStep(step)}
        />
      )}
    </div>
  );
}
