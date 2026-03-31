/**
 * 파일 코드 설명 패널 컴포넌트
 * 3단계 우측에 표시되는 AI 생성 코드 블록별 설명.
 * 파일 요약 + 블록별 제목/설명을 카드 형태로 표시한다.
 */

import type { FileExplanation } from '@/utils/promptFileExplain';

/** FileExplainPanel props */
interface FileExplainPanelProps {
  /** AI가 생성한 파일 설명 (null이면 아직 분석 안 됨) */
  explanation: FileExplanation | null;
  /** 분석 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 재시도 핸들러 */
  onRetry: () => void;
}

/** 파일 코드 설명 패널 (우측) */
export function FileExplainPanel({ explanation, isLoading, error, onRetry }: FileExplainPanelProps) {
  return (
    <aside className="w-80 bg-surface-container-low border-l border-outline-variant/30 flex flex-col shrink-0 overflow-y-auto">
      <div className="h-10 px-4 flex items-center border-b border-outline-variant/30 bg-surface-container-low">
        <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
          코드 설명
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-mint font-mono text-sm animate-pulse">
              AI가 이 파일을 분석하고 있어요...
            </p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-8">
            <p className="text-error-red font-mono text-sm mb-3">{error}</p>
            <button onClick={onRetry} className="bg-mint text-on-mint px-4 py-1.5 font-mono text-xs font-bold">
              Retry
            </button>
          </div>
        )}

        {/* 아직 분석 안 된 상태 */}
        {!isLoading && !error && !explanation && (
          <div className="text-center py-8">
            <p className="text-outline font-mono text-xs">
              파일을 선택하면 AI가 코드를 설명해줍니다.
            </p>
          </div>
        )}

        {/* 분석 완료 — 파일 요약 */}
        {explanation && (
          <>
            <div className="bg-surface-container-highest border border-mint/30 p-4">
              <div className="flex items-center gap-2 mb-2 text-mint">
                <span className="w-1 h-3 bg-mint" />
                <span className="text-[10px] font-bold uppercase tracking-widest">파일 요약</span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">
                {explanation.summary}
              </p>
            </div>

            {/* 블록별 설명 카드 */}
            {explanation.blocks.map((block, i) => (
              <div key={i} className="bg-surface-container-high border border-outline-variant/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-mint font-bold">
                    #{String(i + 1).padStart(2, '0')} {block.title}
                  </span>
                  <span className="text-[9px] font-mono text-outline">
                    L{block.startLine}–{block.endLine}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {block.explanation}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
