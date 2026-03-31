/**
 * Step3CodeWalkthrough 헬퍼 컴포넌트 모음
 * 로딩, 에러, 빈 상태, 단계 네비게이션 등 보조 UI를 담당한다.
 */

/** StepNavigation에 전달하는 props */
export interface StepNavigationProps {
  /** 현재 단계 인덱스 (0부터 시작) */
  currentIdx: number;
  /** 전체 단계 수 */
  totalSteps: number;
  /** 이전 단계로 이동 핸들러 */
  onPrev: () => void;
  /** 다음 단계로 이동 핸들러 */
  onNext: () => void;
}

/** ErrorState에 전달하는 props */
export interface ErrorStateProps {
  /** 에러 메시지 (null이면 기본 메시지 표시) */
  error: string | null;
  /** 재시도 핸들러 */
  onRetry: () => void;
}

/**
 * 이전/다음 단계 네비게이션 바
 * 진행률 바와 함께 이전/다음 버튼을 렌더링한다.
 * @param props - 현재 인덱스, 전체 단계 수, 이동 핸들러
 */
export function StepNavigation({ currentIdx, totalSteps, onPrev, onNext }: StepNavigationProps) {
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

/**
 * AI가 코드 흐름을 분석하는 동안 표시하는 로딩 상태 컴포넌트
 * @returns 로딩 메시지 UI
 */
export function LoadingState() {
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

/**
 * 분석 실패 시 에러 메시지와 재시도 버튼을 표시하는 컴포넌트
 * @param props - 에러 메시지와 재시도 핸들러
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-error-red font-mono text-sm mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-mint text-on-mint px-6 py-2 font-mono text-sm font-bold"
        >
          Retry Analysis
        </button>
      </div>
    </div>
  );
}

/**
 * 분석 결과에 유저 행동이 없을 때 표시하는 빈 상태 컴포넌트
 * @returns 빈 상태 안내 메시지 UI
 */
export function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-outline font-mono text-sm">
        분석할 유저 행동을 찾지 못했습니다.
      </p>
    </div>
  );
}
