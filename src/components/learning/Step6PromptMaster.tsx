/**
 * 6단계: 프롬프트 마스터 — stitch(13) 기반
 * 3단 레이아웃: 시나리오 + IDE 에디터 + Before/After 비교 + 점수.
 */

'use client';

import { useState } from 'react';
import type { StoredProject } from '@/types/project';
import type { PromptScenario, PromptEvaluation } from '@/types/quiz';
import { useStepAnalysis } from '@/hooks/useStepAnalysis';
import { buildStep6Prompt, buildPromptEvalPrompt } from '@/utils/promptTemplatesAdvanced';
import { callGeminiJSON } from '@/utils/gemini';

interface Step6Props { project: StoredProject; }
interface Step6Response { scenarios: PromptScenario[]; }

/** 6단계: 프롬프트 마스터 */
export function Step6PromptMaster({ project }: Step6Props) {
  const prompt = buildStep6Prompt(project.files);
  const { data, status, error, retry } = useStepAnalysis<Step6Response>('codereadr_step6', prompt);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [evaluation, setEvaluation] = useState<PromptEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (status === 'loading') return <Loading />;
  if (status === 'error' || !data) return <ErrorView msg={error} onRetry={retry} />;

  const scenario = data.scenarios[selectedIdx];

  /** 프롬프트 평가 실행 */
  const handleEvaluate = async () => {
    if (!userPrompt.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const result = await callGeminiJSON<PromptEvaluation>(
        buildPromptEvalPrompt(scenario.description, scenario.relatedFiles, userPrompt)
      );
      setEvaluation(result);
    } catch { setEvaluation(null); }
    setIsEvaluating(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 페이지 헤더 */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-outline-variant/30 bg-surface-container-low shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-on-surface">프롬프트 최적화</h1>
          <span className="text-[10px] font-mono bg-mint/10 text-mint px-2 py-0.5 border border-mint/20">
            PROMPT_ENGINEERING_V2
          </span>
        </div>
        {evaluation && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-outline">Score</span>
            <span className="text-lg font-mono font-bold text-mint">{evaluation.totalScore}/100</span>
          </div>
        )}
      </div>

      {/* 3단 그리드 */}
      <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
        {/* 좌: 시나리오 카드 */}
        <section className="col-span-3 flex flex-col overflow-hidden">
          <div className="flex-1 bg-surface-container-low border border-outline-variant/30 flex flex-col">
            <div className="p-3 border-b border-outline-variant/30">
              <h2 className="text-xs font-bold uppercase tracking-wider text-outline">시나리오</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {data.scenarios.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedIdx(i); setUserPrompt(''); setEvaluation(null); }}
                  className={`w-full text-left p-4 border-b border-outline-variant/20 transition-colors ${
                    i === selectedIdx ? 'bg-surface-container-high border-l-2 border-mint' : 'hover:bg-surface-container border-l-2 border-transparent'
                  }`}
                >
                  <span className="text-[10px] font-mono text-mint">SC-{String(i + 1).padStart(3, '0')}</span>
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-3">{s.title}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 중앙: 프롬프트 에디터 */}
        <section className="col-span-5 flex flex-col overflow-hidden">
          <div className="flex-1 bg-surface-container-highest border border-outline-variant/50 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-mint" />
                <span className="text-[10px] font-mono text-on-surface">훈련 에디터</span>
              </div>
            </div>
            {/* 시나리오 설명 */}
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/50">
              <p className="text-xs text-on-surface-variant leading-relaxed">{scenario.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {scenario.relatedFiles.map((f) => (
                  <span key={f} className="text-[9px] font-mono bg-secondary-container text-on-surface-variant px-1.5 py-0.5">{f}</span>
                ))}
              </div>
            </div>
            {/* 에디터 영역 */}
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              spellCheck={false}
              placeholder="이 기능을 추가하기 위한 프롬프트를 작성해보세요..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-mint font-mono text-xs p-4 leading-relaxed resize-none overflow-y-auto placeholder:text-outline/30"
            />
            <div className="p-3 border-t border-outline-variant/30 flex justify-end gap-2 bg-surface-container-low/50">
              <button onClick={() => setUserPrompt('')} className="px-4 py-1.5 border border-outline text-[10px] font-mono uppercase tracking-widest text-outline hover:bg-surface-container-high transition-colors">
                Reset
              </button>
              <button onClick={handleEvaluate} disabled={!userPrompt.trim() || isEvaluating} className="px-4 py-1.5 bg-mint text-on-mint text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all">
                {isEvaluating ? 'Evaluating...' : 'Execute Training'}
              </button>
            </div>
          </div>
        </section>

        {/* 우: 평가 결과 / Before-After */}
        <section className="col-span-4 flex flex-col overflow-hidden">
          <div className="flex-1 bg-surface-container-low border border-outline-variant/30 flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-outline-variant/30">
              <h2 className="text-xs font-bold uppercase tracking-wider text-outline">변화 분석</h2>
            </div>
            <div className="p-4 space-y-6 flex-1">
              {evaluation ? (
                <EvaluationResult evaluation={evaluation} userPrompt={userPrompt} />
              ) : (
                <p className="text-outline font-mono text-[11px]">프롬프트를 작성하고 평가받으면 결과가 표시됩니다.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** 평가 결과 표시 */
function EvaluationResult({ evaluation, userPrompt }: { evaluation: PromptEvaluation; userPrompt: string }) {
  return (
    <>
      {/* Before */}
      <div>
        <span className="text-[9px] font-mono bg-error-red/10 text-error-red px-1.5 border border-error-red/20">BEFORE</span>
        <div className="mt-2 bg-surface-container-lowest p-3 border-l border-error-red/50 font-mono text-[10px] text-on-surface-variant/70 italic">
          {userPrompt}
        </div>
      </div>
      {/* After */}
      <div>
        <span className="text-[9px] font-mono bg-mint/10 text-mint px-1.5 border border-mint/20">AFTER</span>
        <div className="mt-2 bg-surface-container-lowest p-3 border-l-2 border-mint font-mono text-[11px] text-mint/90 leading-relaxed">
          {evaluation.improvedPrompt}
        </div>
      </div>
      {/* 피드백 */}
      <div>
        <span className="text-[10px] font-mono text-outline uppercase">Feedback</span>
        <p className="mt-1 text-sm text-on-surface-variant leading-relaxed">{evaluation.feedback}</p>
      </div>
      {/* 메트릭 */}
      <div className="grid grid-cols-3 gap-3">
        <Metric label="구체성" value={evaluation.specificityScore} />
        <Metric label="기술용어" value={evaluation.technicalTermScore} />
        <Metric label="완성도" value={evaluation.completenessScore} />
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 bg-surface-container-high border border-outline-variant/20">
      <div className="text-[9px] text-outline font-mono uppercase">{label}</div>
      <div className="text-lg font-mono text-mint">{value}</div>
    </div>
  );
}

function Loading() { return <div className="flex items-center justify-center h-full"><p className="text-mint font-mono text-sm animate-pulse">AI가 시나리오를 생성하고 있어요...</p></div>; }
function ErrorView({ msg, onRetry }: { msg: string | null; onRetry: () => void }) { return <div className="flex items-center justify-center h-full flex-col gap-4"><p className="text-error-red font-mono text-sm">{msg}</p><button onClick={onRetry} className="bg-mint text-on-mint px-6 py-2 font-mono text-sm font-bold">Retry</button></div>; }
