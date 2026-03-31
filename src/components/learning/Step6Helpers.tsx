/**
 * 6단계 프롬프트 마스터 — 보조 컴포넌트 모음
 * EvaluationResult, Metric, Loading, ErrorView를 포함한다.
 */

import type { PromptEvaluation } from '@/types/quiz';

/** EvaluationResult 컴포넌트의 props */
interface EvaluationResultProps {
  /** AI 평가 결과 객체 */
  evaluation: PromptEvaluation;
  /** 유저가 작성한 원본 프롬프트 */
  userPrompt: string;
}

/** Metric 컴포넌트의 props */
interface MetricProps {
  /** 지표 레이블 (예: 구체성, 기술용어) */
  label: string;
  /** 점수 값 (0~100) */
  value: number;
}

/** ErrorView 컴포넌트의 props */
interface ErrorViewProps {
  /** 에러 메시지 (null일 수 있음) */
  msg: string | null;
  /** 재시도 콜백 */
  onRetry: () => void;
}

/**
 * 프롬프트 평가 결과를 Before/After + 피드백 + 메트릭으로 표시한다.
 * @param evaluation - AI가 반환한 평가 결과
 * @param userPrompt - 유저가 작성한 원본 프롬프트 텍스트
 */
export function EvaluationResult({ evaluation, userPrompt }: EvaluationResultProps) {
  return (
    <>
      {/* Before — 유저의 원본 프롬프트 */}
      <div>
        <span className="text-[9px] font-mono bg-error-red/10 text-error-red px-1.5 border border-error-red/20">BEFORE</span>
        <div className="mt-2 bg-surface-container-lowest p-3 border-l border-error-red/50 font-mono text-[10px] text-on-surface-variant/70 italic">
          {userPrompt}
        </div>
      </div>
      {/* After — AI가 개선한 프롬프트 */}
      <div>
        <span className="text-[9px] font-mono bg-mint/10 text-mint px-1.5 border border-mint/20">AFTER</span>
        <div className="mt-2 bg-surface-container-lowest p-3 border-l-2 border-mint font-mono text-[11px] text-mint/90 leading-relaxed">
          {evaluation.improvedPrompt}
        </div>
      </div>
      {/* 피드백 텍스트 */}
      <div>
        <span className="text-[10px] font-mono text-outline uppercase">Feedback</span>
        <p className="mt-1 text-sm text-on-surface-variant leading-relaxed">{evaluation.feedback}</p>
      </div>
      {/* 세 가지 평가 메트릭 */}
      <div className="grid grid-cols-3 gap-3">
        <Metric label="구체성" value={evaluation.specificityScore} />
        <Metric label="기술용어" value={evaluation.technicalTermScore} />
        <Metric label="완성도" value={evaluation.completenessScore} />
      </div>
    </>
  );
}

/**
 * 개별 평가 지표를 숫자로 표시하는 카드 컴포넌트.
 * @param label - 지표 이름 (예: "구체성")
 * @param value - 점수 (0~100)
 */
export function Metric({ label, value }: MetricProps) {
  return (
    <div className="p-3 bg-surface-container-high border border-outline-variant/20">
      <div className="text-[9px] text-outline font-mono uppercase">{label}</div>
      <div className="text-lg font-mono text-mint">{value}</div>
    </div>
  );
}

/**
 * AI가 데이터를 로딩 중일 때 표시하는 스피너/메시지 컴포넌트.
 * @returns 로딩 상태 UI
 */
export function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-mint font-mono text-sm animate-pulse">
        AI가 시나리오를 생성하고 있어요...
      </p>
    </div>
  );
}

/**
 * 에러 발생 시 메시지와 재시도 버튼을 표시하는 컴포넌트.
 * @param msg - 표시할 에러 메시지
 * @param onRetry - 재시도 버튼 클릭 시 호출할 콜백
 */
export function ErrorView({ msg, onRetry }: ErrorViewProps) {
  return (
    <div className="flex items-center justify-center h-full flex-col gap-4">
      <p className="text-error-red font-mono text-sm">{msg}</p>
      <button
        onClick={onRetry}
        className="bg-mint text-on-mint px-6 py-2 font-mono text-sm font-bold"
      >
        Retry
      </button>
    </div>
  );
}
