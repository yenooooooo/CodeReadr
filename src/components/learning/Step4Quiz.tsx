/**
 * 4단계: 퀴즈 & 설명 연습 — stitch(14) 기반
 * 코드 스니펫 + 질문 + 답변 입력 + AI 평가 + 원형 점수 게이지.
 */

'use client';

import { useState } from 'react';
import type { StoredProject } from '@/types/project';
import type { Quiz, QuizEvaluation } from '@/types/quiz';
import { useStepAnalysis } from '@/hooks/useStepAnalysis';
import { buildStep4Prompt } from '@/utils/promptTemplatesAdvanced';
import { buildQuizEvalPrompt } from '@/utils/promptEvalTemplates';
import { callGeminiJSON } from '@/utils/gemini';
import { CodeViewer } from './CodeViewer';
import { ScoreGauge } from './ScoreGauge';

interface Step4Props { project: StoredProject; }
interface Step4Response { quizzes: Quiz[]; }

/** 4단계: 퀴즈 */
export function Step4Quiz({ project }: Step4Props) {
  const prompt = buildStep4Prompt(project.files);
  const { data, status, error, retry } = useStepAnalysis<Step4Response>('codereadr_step4', prompt);

  const [currentIdx, setCurrentIdx] = useState(0); // 현재 문제 인덱스
  const [userAnswer, setUserAnswer] = useState(''); // 유저 답변
  const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null); // AI 평가
  const [isEvaluating, setIsEvaluating] = useState(false); // 평가 중 여부

  if (status === 'loading') return <Loading msg="AI가 퀴즈를 출제하고 있어요..." />;
  if (status === 'error' || !data) return <Error msg={error} onRetry={retry} />;

  const quiz = data.quizzes[currentIdx];
  const total = data.quizzes.length;

  /** 답변 제출 → AI 평가 */
  const handleSubmit = async () => {
    if (!userAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const result = await callGeminiJSON<QuizEvaluation>(
        buildQuizEvalPrompt(quiz.question, quiz.codeBlock, quiz.correctAnswer, userAnswer)
      );
      setEvaluation(result);
    } catch { setEvaluation(null); }
    setIsEvaluating(false);
  };

  /** 다음 문제로 */
  const handleNext = () => {
    setCurrentIdx((i) => Math.min(total - 1, i + 1));
    setUserAnswer('');
    setEvaluation(null);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측: 코드 + 답변 입력 */}
      <div className="flex-1 flex flex-col border-r border-outline-variant/30">
        {/* 상단: 문제 헤더 */}
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-end bg-surface-container-low">
          <div>
            <h1 className="text-xl font-bold text-on-surface flex items-center gap-3">
              로직 리뷰 퀴즈
              <span className="text-[10px] font-mono bg-mint-container text-mint px-2 py-0.5">
                ID: QUIZ_{String(currentIdx + 1).padStart(3, '0')}
              </span>
            </h1>
            <p className="text-outline text-sm mt-1">{quiz.question}</p>
          </div>
          <span className="text-[10px] font-mono text-outline">
            {currentIdx + 1} / {total}
          </span>
        </div>

        {/* 코드 스니펫 */}
        <div className="flex-[1.2] p-6 overflow-y-auto">
          <CodeViewer code={quiz.codeBlock} filePath={quiz.filePath} />
        </div>

        {/* 답변 입력 */}
        <div className="flex-1 p-6 border-t border-outline-variant/30 flex flex-col bg-surface-container-lowest">
          <label className="font-bold text-sm uppercase tracking-widest text-mint mb-4">
            분석 제출
          </label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="이 코드가 하는 일을 설명해보세요..."
            className="flex-1 bg-surface-container-low border border-outline-variant focus:border-mint focus:ring-0 text-on-surface font-mono text-sm p-4 resize-none transition-all placeholder:text-outline/40"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={evaluation ? handleNext : handleSubmit}
              disabled={!userAnswer.trim() && !evaluation}
              className="bg-mint text-on-mint px-8 py-2 font-bold uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30"
            >
              {evaluation ? 'NEXT_QUIZ' : isEvaluating ? 'EVALUATING...' : 'SUBMIT_ANALYSIS'}
            </button>
          </div>
        </div>
      </div>

      {/* 우측: 점수 패널 */}
      <aside className="w-80 bg-surface-container-low flex flex-col shrink-0">
        <div className="p-6 border-b border-outline-variant/30">
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-6">점수 지표</h3>
          <ScoreGauge score={evaluation?.score ?? 0} />
        </div>

        {/* 평가 피드백 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {evaluation ? (
            <div className="space-y-4">
              <FeedbackSection title="잘한 점" content={evaluation.strengths} color="text-mint" />
              <FeedbackSection title="부족한 점" content={evaluation.weaknesses} color="text-error-red" />
              <FeedbackSection title="모범 답변" content={evaluation.modelAnswer} color="text-on-surface" />
            </div>
          ) : (
            <p className="text-outline font-mono text-[11px]">답변을 제출하면 AI가 평가합니다.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function FeedbackSection({ title, content, color }: { title: string; content: string; color: string }) {
  return (
    <div>
      <h4 className={`text-[10px] font-mono uppercase mb-1 ${color}`}>{title}</h4>
      <p className="text-sm text-on-surface-variant leading-relaxed">{content}</p>
    </div>
  );
}

function Loading({ msg }: { msg: string }) {
  return <div className="flex items-center justify-center h-full"><p className="text-mint font-mono text-sm animate-pulse">{msg}</p></div>;
}
function Error({ msg, onRetry }: { msg: string | null; onRetry: () => void }) {
  return <div className="flex items-center justify-center h-full flex-col gap-4"><p className="text-error-red font-mono text-sm">{msg}</p><button onClick={onRetry} className="bg-mint text-on-mint px-6 py-2 font-mono text-sm font-bold">Retry</button></div>;
}
