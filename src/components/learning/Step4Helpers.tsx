/**
 * Step4Quiz 보조 컴포넌트 모음
 * 점수 패널, 피드백, 상태 표시 컴포넌트를 분리.
 */

import type { QuizEvaluation } from '@/types/quiz';
import { ScoreGauge } from './ScoreGauge';

/** 점수 + 피드백 패널 (우측) */
export function QuizScorePanel({ evaluation }: { evaluation: QuizEvaluation | null }) {
  return (
    <aside className="w-80 bg-surface-container-low flex flex-col shrink-0">
      <div className="p-6 border-b border-outline-variant/30">
        <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-6">점수 지표</h3>
        <ScoreGauge score={evaluation?.score ?? 0} />
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {evaluation ? (
          <div className="space-y-4">
            <FB title="잘한 점" content={evaluation.strengths} color="text-mint" />
            <FB title="부족한 점" content={evaluation.weaknesses} color="text-error-red" />
            <FB title="모범 답변" content={evaluation.modelAnswer} color="text-on-surface" />
          </div>
        ) : (
          <p className="text-outline font-mono text-[11px]">답변을 제출하면 AI가 평가합니다.</p>
        )}
      </div>
    </aside>
  );
}

/** 피드백 섹션 */
function FB({ title, content, color }: { title: string; content: string; color: string }) {
  return (
    <div>
      <h4 className={`text-[10px] font-mono uppercase mb-1 ${color}`}>{title}</h4>
      <p className="text-sm text-on-surface-variant leading-relaxed">{content}</p>
    </div>
  );
}

/** 학습한 파일 없음 안내 */
export function NoStudiedFiles() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 bg-surface-container-high border border-outline-variant flex items-center justify-center">
          <span className="text-2xl">📖</span>
        </div>
        <h2 className="text-on-surface font-bold text-lg mb-2">먼저 코드를 읽어보세요</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
          퀴즈는 3단계에서 학습한 파일 기반으로 출제됩니다.
          먼저 3단계에서 파일을 클릭하여 코드를 학습해주세요.
        </p>
        <a href="/learn/step/3" className="inline-block bg-mint text-on-mint px-6 py-2 font-mono text-sm font-bold">
          3단계로 이동
        </a>
      </div>
    </div>
  );
}

/** 로딩 상태 */
export function QuizLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-mint font-mono text-sm animate-pulse">
        학습한 파일 기반으로 퀴즈를 출제하고 있어요...
      </p>
    </div>
  );
}

/** 에러 상태 */
export function QuizError({ msg, onRetry }: { msg: string | null; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-full flex-col gap-4">
      <p className="text-error-red font-mono text-sm">{msg}</p>
      <button onClick={onRetry} className="bg-mint text-on-mint px-6 py-2 font-mono text-sm font-bold">
        Retry
      </button>
    </div>
  );
}
