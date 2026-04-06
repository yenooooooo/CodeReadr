/**
 * 4단계: 퀴즈 & 설명 연습
 * 3단계에서 학습 완료한 파일 기반으로 퀴즈를 출제한다.
 * 학습하지 않은 파일에서는 문제가 나오지 않음.
 * 보조 컴포넌트는 Step4Helpers.tsx로 분리됨.
 */

'use client';

import { useState, useEffect } from 'react';
import type { StoredProject, ProjectFile } from '@/types/project';
import type { Quiz, QuizEvaluation } from '@/types/quiz';
import { useStepAnalysis } from '@/hooks/useStepAnalysis';
import { buildStep4Prompt, buildStep4DocPrompt } from '@/utils/promptTemplatesAdvanced';
import { buildQuizEvalPrompt } from '@/utils/promptEvalTemplates';
import { callGeminiJSON } from '@/utils/gemini';
import { filterStudiedFiles } from '@/utils/studiedFiles';
import { isDocOnlyProject } from '@/utils/fileParser';
import { CodeViewer } from './CodeViewer';
import { QuizScorePanel, NoStudiedFiles, QuizLoading, QuizError } from './Step4Helpers';

interface Step4Props { project: StoredProject; }
interface Step4Response { quizzes: Quiz[]; }

/** 4단계: 퀴즈 */
export function Step4Quiz({ project }: Step4Props) {
  const [studiedFiles, setStudiedFiles] = useState<ProjectFile[]>([]);

  const docOnly = isDocOnlyProject(project.files);

  // 문서 전용: 전체 파일 사용 / 코드 프로젝트: 3단계 학습 완료 파일만
  useEffect(() => {
    setStudiedFiles(docOnly ? project.files : filterStudiedFiles(project.files));
  }, [project.files, docOnly]);

  const hasStudied = studiedFiles.length > 0;
  // 학습 파일 수를 캐시 키에 포함 → 새 파일 학습 시 퀴즈 재생성
  const cacheKey = `codereadr_step4_${studiedFiles.length}`;
  const prompt = hasStudied
    ? (docOnly ? buildStep4DocPrompt(studiedFiles) : buildStep4Prompt(studiedFiles))
    : null;
  const { data, status, error, retry } = useStepAnalysis<Step4Response>(cacheKey, prompt);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!hasStudied) return <NoStudiedFiles docOnly={docOnly} />;
  if (status === 'loading') return <QuizLoading />;
  if (status === 'error' || !data) return <QuizError msg={error} onRetry={retry} />;

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

  const handleNext = () => {
    setCurrentIdx((i) => Math.min(total - 1, i + 1));
    setUserAnswer('');
    setEvaluation(null);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col border-r border-outline-variant/30">
        {/* 헤더 */}
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-end bg-surface-container-low">
          <div>
            <h1 className="text-xl font-bold text-on-surface flex items-center gap-3">
              {docOnly ? '개념 이해 퀴즈' : '로직 리뷰 퀴즈'}
              <span className="text-[10px] font-mono bg-mint-container text-mint px-2 py-0.5">
                학습 파일 {studiedFiles.length}개 기반
              </span>
            </h1>
            <p className="text-outline text-sm mt-1">{quiz.question}</p>
          </div>
          <span className="text-[10px] font-mono text-outline">{currentIdx + 1}/{total}</span>
        </div>
        {/* 코드 */}
        <div className="flex-[1.2] p-6 overflow-y-auto">
          <CodeViewer code={quiz.codeBlock} filePath={quiz.filePath} />
        </div>
        {/* 답변 입력 */}
        <div className="flex-1 p-6 border-t border-outline-variant/30 flex flex-col bg-surface-container-lowest">
          <label className="font-bold text-sm uppercase tracking-widest text-mint mb-4">분석 제출</label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={docOnly ? "이 내용에 대해 설명해보세요..." : "이 코드가 하는 일을 설명해보세요..."}
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
      <QuizScorePanel evaluation={evaluation} />
    </div>
  );
}
