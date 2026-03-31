/**
 * 3단계: 코드 따라읽기 — 파일별 전체 코드 학습
 * 업로드된 모든 파일을 하나씩 선택하여 AI가 코드를 블록 단위로 설명.
 * 좌: 파일 목록 + 진행률 | 중: 코드 뷰어(하이라이트) | 우: AI 설명 패널
 */

'use client';

import { useState, useCallback } from 'react';
import type { StoredProject } from '@/types/project';
import { callGeminiJSON } from '@/utils/gemini';
import { buildFileExplainPrompt } from '@/utils/promptFileExplain';
import type { FileExplanation } from '@/utils/promptFileExplain';
import { CodeViewer } from './CodeViewer';
import { FileExplainPanel } from './FileExplainPanel';

/** Step3 props */
interface Step3Props {
  project: StoredProject;
}

/** 3단계: 파일별 코드 따라읽기 */
export function Step3CodeWalkthrough({ project }: Step3Props) {
  const { files } = project;
  const [selectedIdx, setSelectedIdx] = useState(0); // 선택된 파일 인덱스
  const [explanations, setExplanations] = useState<Record<string, FileExplanation>>({}); // 캐시
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentFile = files[selectedIdx];
  const currentExplanation = explanations[currentFile.path] ?? null;
  // 설명 완료된 파일 수
  const completedCount = Object.keys(explanations).length;

  /** 파일 선택 시 → 캐시에 없으면 AI 분석 호출 */
  const handleSelectFile = useCallback(async (idx: number) => {
    setSelectedIdx(idx);
    setError(null);
    const file = files[idx];

    // 이미 분석된 파일이면 스킵
    if (explanations[file.path]) return;

    // localStorage 캐시 확인
    const cacheKey = `codereadr_file_${file.path}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setExplanations((prev) => ({ ...prev, [file.path]: JSON.parse(cached) }));
        return;
      }
    } catch { /* 무시 */ }

    // Gemini API 호출
    setIsLoading(true);
    try {
      const result = await callGeminiJSON<FileExplanation>(
        buildFileExplainPrompt(file.path, file.content)
      );
      setExplanations((prev) => ({ ...prev, [file.path]: result }));
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      setError('이 파일 분석에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [files, explanations]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측: 파일 목록 */}
      <aside className="w-72 bg-surface border-r border-outline-variant/30 flex flex-col shrink-0">
        <div className="h-10 px-4 flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-low">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
            전체 파일 ({files.length})
          </span>
          <span className="text-[10px] font-mono text-mint">
            {completedCount}/{files.length}
          </span>
        </div>
        {/* 전체 진행률 바 */}
        <div className="h-1 bg-surface-container-high">
          <div className="h-full bg-mint transition-all" style={{ width: `${(completedCount / files.length) * 100}%` }} />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {files.map((file, i) => {
            const done = !!explanations[file.path];
            const active = i === selectedIdx;
            return (
              <button
                key={file.path}
                onClick={() => handleSelectFile(i)}
                className={`
                  w-full text-left flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] transition-colors
                  ${active ? 'bg-surface-container-high text-mint border-l-2 border-mint' : 'text-on-surface-variant hover:bg-surface-container-high border-l-2 border-transparent'}
                `}
              >
                <span className={`text-[10px] ${done ? 'text-mint' : 'text-outline'}`}>
                  {done ? '✓' : '○'}
                </span>
                <span className="truncate">{file.path}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 중앙: 코드 뷰어 */}
      <div className="flex-1 p-6 overflow-y-auto">
        <CodeViewer code={currentFile.content} filePath={currentFile.path} />
      </div>

      {/* 우측: AI 설명 패널 */}
      <FileExplainPanel
        explanation={currentExplanation}
        isLoading={isLoading}
        error={error}
        onRetry={() => handleSelectFile(selectedIdx)}
      />
    </div>
  );
}
