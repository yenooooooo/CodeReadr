/** 5단계: 코드 리뷰 훈련 — 학습 파일 기반, 힌트 + before/after 비교 */
'use client';

import { useState, useEffect } from 'react';
import type { StoredProject, ProjectFile } from '@/types/project';
import type { ReviewChallenge } from '@/types/quiz';
import { useStepAnalysis } from '@/hooks/useStepAnalysis';
import { buildStep5Prompt } from '@/utils/promptTemplatesAdvanced';
import { filterStudiedFiles } from '@/utils/studiedFiles';
import { CodeViewer } from './CodeViewer';
import { NoStudiedFiles } from './Step4Helpers';

interface Step5Props { project: StoredProject; }
interface Step5Response { challenges: ReviewChallenge[]; }

/** 5단계: 코드 리뷰 훈련 — 학습 완료 파일 기반 */
export function Step5CodeReview({ project }: Step5Props) {
  // 3단계에서 학습 완료한 파일만 필터링
  const [studiedFiles, setStudiedFiles] = useState<ProjectFile[]>([]);
  useEffect(() => {
    setStudiedFiles(filterStudiedFiles(project.files));
  }, [project.files]);

  const hasStudied = studiedFiles.length > 0;
  const cacheKey = `codereadr_step5_${studiedFiles.length}`;
  const prompt = hasStudied ? buildStep5Prompt(studiedFiles) : null;
  const { data, status, error, retry } = useStepAnalysis<Step5Response>(cacheKey, prompt);

  const [currentIdx, setCurrentIdx] = useState(0); // 현재 챌린지 인덱스
  const [hintLevel, setHintLevel] = useState(0); // 표시된 힌트 단계 (0=없음, 1~3)
  const [showAnswer, setShowAnswer] = useState(false); // 정답 공개 여부

  if (!hasStudied) return <NoStudiedFiles />;
  if (status === 'loading') return <Loading />;
  if (status === 'error' || !data) return <ErrorView msg={error} onRetry={retry} />;

  const challenge = data.challenges[currentIdx];
  const total = data.challenges.length;

  /** 다음 챌린지로 */
  const handleNext = () => {
    setCurrentIdx((i) => Math.min(total - 1, i + 1));
    setHintLevel(0);
    setShowAnswer(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측: 코드 + 힌트 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-on-surface">코드 리뷰 훈련</h1>
            <p className="text-outline text-sm mt-1">이 코드에서 문제를 찾아보세요.</p>
          </div>
          <div className="flex items-center gap-3">
            <CategoryBadge category={challenge.category} />
            <span className="text-[10px] font-mono text-outline">{currentIdx + 1}/{total}</span>
          </div>
        </div>

        {/* 코드 블록 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <CodeViewer code={challenge.codeBlock} filePath={challenge.filePath} />

          {/* 힌트 영역 */}
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`border p-4 transition-all ${
                hintLevel > i
                  ? 'border-mint/30 bg-mint/5'
                  : 'border-outline-variant/30 bg-surface-container-low'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-outline uppercase">
                    Hint Level {i + 1}
                  </span>
                  {hintLevel <= i && (
                    <button
                      onClick={() => setHintLevel(i + 1)}
                      className="text-[10px] font-mono text-mint hover:underline"
                    >
                      REVEAL
                    </button>
                  )}
                </div>
                {hintLevel > i && (
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                    {challenge.hints[i]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="h-14 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between px-6">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-4 py-1.5 border border-outline-variant text-[10px] font-mono uppercase tracking-widest text-outline hover:bg-surface-container-high transition-colors"
          >
            {showAnswer ? 'HIDE ANSWER' : 'SHOW ANSWER'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentIdx === total - 1}
            className="px-4 py-1.5 bg-mint text-on-mint text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-30"
          >
            Next Challenge
          </button>
        </div>
      </div>

      {/* 우측: 정답 패널 (Before/After) */}
      {showAnswer && (
        <aside className="w-96 bg-surface-container-low border-l border-outline-variant/50 p-6 overflow-y-auto shrink-0 space-y-6">
          <Section title="문제점" color="text-error-red">
            <p className="text-sm text-on-surface-variant leading-relaxed">{challenge.issue}</p>
          </Section>
          <Section title="Before" color="text-error-red">
            <CodeViewer code={challenge.codeBlock} filePath={challenge.filePath} />
          </Section>
          <Section title="After" color="text-mint">
            <CodeViewer code={challenge.improvedCode} filePath={challenge.filePath} />
          </Section>
          <Section title="왜 이렇게 고쳐야 하나요?" color="text-on-surface">
            <p className="text-sm text-on-surface-variant leading-relaxed">{challenge.improvementReason}</p>
          </Section>
        </aside>
      )}
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return <div><h4 className={`text-[10px] font-mono uppercase mb-2 ${color}`}>{title}</h4>{children}</div>;
}

function CategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = { security: 'SECURITY', performance: 'PERF', structure: 'STRUCT', error_handling: 'ERROR', accessibility: 'A11Y' };
  return <span className="text-[9px] font-mono bg-secondary-container text-on-surface-variant px-2 py-0.5">{labels[category] || category}</span>;
}

function Loading() { return <div className="flex items-center justify-center h-full"><p className="text-mint font-mono text-sm animate-pulse">코드 리뷰 포인트를 찾고 있어요...</p></div>; }
function ErrorView({ msg, onRetry }: { msg: string | null; onRetry: () => void }) { return <div className="flex items-center justify-center h-full flex-col gap-4"><p className="text-error-red text-sm">{msg}</p><button onClick={onRetry} className="bg-mint text-on-mint px-6 py-2 font-mono text-sm font-bold">Retry</button></div>; }
