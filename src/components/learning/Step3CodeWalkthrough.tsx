/**
 * 3단계: 코드 따라읽기 컴포넌트
 * 유저 행동별 코드 실행 흐름을 단계별로 보여준다.
 * stitch(12) 기반: 파일 탐색기 + 코드 뷰어 + 주석 말풍선.
 */

'use client';

import { useState } from 'react';
import type { StoredProject } from '@/types/project';
import type { UserFlow } from '@/types/learning';
import { useStepAnalysis } from '@/hooks/useStepAnalysis';
import { buildStep3Prompt } from '@/utils/promptTemplates';
import { CodeViewer } from './CodeViewer';
import { FlowStepAnnotation } from './FlowStepAnnotation';

/** Step3 props */
interface Step3Props {
  project: StoredProject;
}

/** Gemini 응답 구조 */
interface Step3Response {
  flows: UserFlow[];
}

/** 3단계: 코드 따라읽기 */
export function Step3CodeWalkthrough({ project }: Step3Props) {
  const prompt = buildStep3Prompt(project.files);
  const { data, status, error, retry } = useStepAnalysis<Step3Response>(
    'codereadr_step3', prompt
  );

  const [selectedFlowIdx, setSelectedFlowIdx] = useState(0); // 선택된 유저 행동
  const [currentStepIdx, setCurrentStepIdx] = useState(0); // 현재 코드 흐름 단계

  // 로딩 / 에러 상태 처리
  if (status === 'loading') {
    return <LoadingState />;
  }
  if (status === 'error' || !data) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  const flows = data.flows;
  if (flows.length === 0) {
    return <EmptyState />;
  }

  const currentFlow = flows[selectedFlowIdx]; // 현재 선택된 유저 행동
  const currentStep = currentFlow.steps[currentStepIdx]; // 현재 코드 흐름 단계
  const totalSteps = currentFlow.steps.length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측: 유저 행동 목록 + 단계 네비게이션 */}
      <aside className="w-72 bg-surface border-r border-outline-variant/30 flex flex-col shrink-0">
        <div className="h-10 px-4 flex items-center border-b border-outline-variant/30 bg-surface-container-low">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
            유저 행동 흐름
          </span>
        </div>

        {/* 유저 행동 목록 */}
        <div className="p-2 border-b border-outline-variant/30">
          {flows.map((flow, i) => (
            <button
              key={flow.id}
              onClick={() => { setSelectedFlowIdx(i); setCurrentStepIdx(0); }}
              className={`
                w-full text-left flex items-center gap-2 px-3 py-2 font-mono text-[11px] transition-colors
                ${i === selectedFlowIdx
                  ? 'bg-surface-container-high text-mint border-l-2 border-mint'
                  : 'text-on-surface-variant hover:bg-surface-container-high border-l-2 border-transparent'
                }
              `}
            >
              <span className="text-[10px] text-outline">{String(i + 1).padStart(2, '0')}</span>
              <span className="truncate">{flow.actionName}</span>
            </button>
          ))}
        </div>

        {/* 코드 흐름 단계 목록 */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-[10px] font-mono text-outline uppercase px-3 mb-2">
            Execution Steps ({totalSteps})
          </p>
          {currentFlow.steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setCurrentStepIdx(i)}
              className={`
                w-full text-left flex items-start gap-2 px-3 py-2 font-mono text-[10px] transition-colors
                ${i === currentStepIdx
                  ? 'bg-mint/10 text-mint'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
                }
              `}
            >
              <span className="text-mint shrink-0 mt-0.5">
                {String(step.order).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="truncate">{step.filePath}</p>
                <p className="text-outline truncate">{step.functionName}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* 중앙 + 우측: 코드 뷰어 + 주석 */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 바: 현재 파일 + 단계 카운터 */}
        <div className="h-10 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between px-4">
          <span className="font-mono text-xs text-mint">
            {currentStep.filePath} → {currentStep.functionName}
          </span>
          <span className="font-mono text-[10px] text-outline">
            STEP {currentStepIdx + 1} / {totalSteps}
          </span>
        </div>

        {/* 코드 + 주석 영역 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 코드 뷰어 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <CodeViewer
              code={currentStep.codeBlock}
              filePath={currentStep.filePath}
              highlightStart={1}
              highlightEnd={currentStep.codeBlock.split('\n').length}
            />
          </div>

          {/* 우측 주석 말풍선 패널 */}
          <div className="w-80 p-6 overflow-y-auto shrink-0 border-l border-outline-variant/30">
            <FlowStepAnnotation step={currentStep} />
          </div>
        </div>

        {/* 하단: 이전/다음 네비게이션 */}
        <StepNavigation
          currentIdx={currentStepIdx}
          totalSteps={totalSteps}
          onPrev={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
          onNext={() => setCurrentStepIdx((i) => Math.min(totalSteps - 1, i + 1))}
        />
      </section>
    </div>
  );
}

/** 이전/다음 네비게이션 바 */
function StepNavigation({ currentIdx, totalSteps, onPrev, onNext }: {
  currentIdx: number; totalSteps: number;
  onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="h-14 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between px-6">
      <button
        onClick={onPrev}
        disabled={currentIdx === 0}
        className="px-4 py-1.5 border border-outline-variant text-[10px] font-mono uppercase tracking-widest text-outline hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {/* 진행률 바 */}
      <div className="flex-1 mx-6 h-1 bg-surface-container-high">
        <div
          className="h-full bg-mint transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalSteps) * 100}%` }}
        />
      </div>
      <button
        onClick={onNext}
        disabled={currentIdx === totalSteps - 1}
        className="px-4 py-1.5 bg-mint text-on-mint text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

/** 로딩 상태 */
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-mint font-mono text-sm animate-pulse mb-2">
          AI가 코드 흐름을 분석하고 있어요...
        </p>
        <p className="text-outline text-xs font-mono">
          유저 행동별 실행 순서를 추적 중입니다
        </p>
      </div>
    </div>
  );
}

/** 에러 상태 */
function ErrorState({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-error-red font-mono text-sm mb-4">{error}</p>
        <button onClick={onRetry} className="bg-mint text-on-mint px-6 py-2 font-mono text-sm font-bold">
          Retry Analysis
        </button>
      </div>
    </div>
  );
}

/** 빈 상태 */
function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-outline font-mono text-sm">분석할 유저 행동을 찾지 못했습니다.</p>
    </div>
  );
}
