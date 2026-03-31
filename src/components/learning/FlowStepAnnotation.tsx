/**
 * 코드 흐름 주석 말풍선 컴포넌트
 * stitch(12)의 "로직 주석" 디자인 참고.
 * 현재 코드 단계의 설명 + 다음 단계 전환 이유를 표시.
 */

import type { CodeFlowStep } from '@/types/learning';

/** FlowStepAnnotation props */
interface FlowStepAnnotationProps {
  /** 현재 코드 흐름 단계 */
  step: CodeFlowStep;
}

/** 코드 흐름 주석 말풍선 */
export function FlowStepAnnotation({ step }: FlowStepAnnotationProps) {
  return (
    <div className="space-y-4">
      {/* 코드 설명 (메인 주석) */}
      <div className="bg-surface-container-highest border border-mint/40 p-4">
        <div className="flex items-center gap-2 mb-3 text-mint">
          <CommentIcon />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            로직 주석 #{String(step.order).padStart(2, '0')}
          </span>
        </div>
        <p className="text-sm text-on-surface leading-relaxed">
          {step.explanation}
        </p>
      </div>

      {/* 파일 + 함수 정보 */}
      <div className="bg-surface-container-high border border-outline-variant/50 p-4">
        <div className="flex items-center gap-2 mb-3 text-outline">
          <FileIcon />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            실행 위치
          </span>
        </div>
        <div className="space-y-2 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-outline">FILE:</span>
            <span className="text-mint">{step.filePath}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-outline">FUNC:</span>
            <span className="text-on-surface">{step.functionName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-outline">LINE:</span>
            <span className="text-on-surface-variant">
              {step.startLine}–{step.endLine}
            </span>
          </div>
        </div>
      </div>

      {/* 다음 단계로의 전환 이유 */}
      {step.transitionReason && (
        <div className="bg-surface-container-high border border-outline-variant/50 p-4">
          <div className="flex items-center gap-2 mb-3 text-outline">
            <ArrowIcon />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              다음 단계로
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {step.transitionReason}
          </p>
        </div>
      )}
    </div>
  );
}

/** 주석 아이콘 */
function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** 파일 아이콘 */
function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

/** 화살표 아이콘 */
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M7 17l9.2-9.2M17 17V7H7" />
    </svg>
  );
}
