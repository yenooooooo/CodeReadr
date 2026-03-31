/**
 * 메인 페이지 클라이언트 컴포넌트
 * 탭 2개: 파일 업로드 / GitHub URL.
 * 두 입력 방식 모두 ProjectFile[]로 변환 → Gemini 분석 → /learn 이동.
 */

'use client';

import { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useProjectAnalysis } from '@/hooks/useProjectAnalysis';
import { UI_TEXT } from '@/constants';
import { UploadZone } from './UploadZone';
import { GitHubUrlInput } from './GitHubUrlInput';
import { ProjectInfoPanel } from './ProjectInfoPanel';
import { SystemLogs } from './SystemLogs';
import { AnalysisOverlay } from './AnalysisOverlay';
import type { ProjectFile } from '@/types/project';

/** 입력 방식 탭 */
type InputTab = 'file' | 'github';

/** 메인 페이지 클라이언트 */
export function HomeClient() {
  const upload = useFileUpload();
  const analysis = useProjectAnalysis();

  const [activeTab, setActiveTab] = useState<InputTab>('file'); // 현재 활성 탭
  const [githubFiles, setGithubFiles] = useState<ProjectFile[]>([]); // GitHub에서 가져온 파일

  // 현재 활성 탭의 파일 목록
  const activeFiles = activeTab === 'file' ? upload.files : githubFiles;
  const hasFiles = activeFiles.length > 0;

  /** GitHub URL에서 파일 로드 완료 */
  const handleGitHubFilesLoaded = (files: ProjectFile[]) => {
    setGithubFiles(files);
  };

  /** 분석 실행 */
  const handleStartAnalysis = () => {
    analysis.runAnalysis(activeFiles);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full">
      {/* 좌측: 탭 + 입력 영역 + 분석 버튼 + Logs */}
      <section className="flex-1 p-8 flex flex-col">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight mb-2">
            파일 업로드
          </h1>
          <p className="text-on-surface-variant text-sm">
            분석을 위해 프로젝트 소스 파일을 이 작업 공간으로 드래그하십시오.
          </p>
        </header>

        {/* 탭 전환 버튼 */}
        <div className="flex mb-4 border-b border-outline-variant/50">
          <TabButton
            label="파일 업로드"
            isActive={activeTab === 'file'}
            onClick={() => setActiveTab('file')}
          />
          <TabButton
            label="GitHub URL"
            isActive={activeTab === 'github'}
            onClick={() => setActiveTab('github')}
          />
        </div>

        {/* 분석 중이면 오버레이, 아니면 탭별 입력 영역 */}
        {analysis.isAnalyzing ? (
          <AnalysisOverlay isActive={true} />
        ) : activeTab === 'file' ? (
          <UploadZone
            isDragging={upload.isDragging}
            status={upload.status}
            files={upload.files}
            error={upload.error}
            onDrop={upload.handleDrop}
            onDragOver={upload.handleDragOver}
            onDragLeave={upload.handleDragLeave}
            onFileSelect={upload.handleFileSelect}
          />
        ) : (
          <GitHubUrlInput
            onFilesLoaded={handleGitHubFilesLoaded}
            onError={(msg) => analysis.addLog('ERROR', msg)}
            onLog={analysis.addLog}
          />
        )}

        {/* 파일 로드 완료 시 분석 시작 버튼 */}
        {hasFiles && (
          <button
            onClick={handleStartAnalysis}
            disabled={analysis.isAnalyzing}
            className={`
              mt-4 w-full py-3 font-mono font-bold text-sm uppercase tracking-widest transition-all
              ${analysis.isAnalyzing
                ? 'bg-mint/30 text-mint cursor-wait animate-pulse'
                : 'bg-mint text-on-mint hover:opacity-90 active:scale-[0.99]'
              }
            `}
          >
            {analysis.isAnalyzing ? UI_TEXT.LOADING_ANALYSIS : 'Execute Analysis'}
          </button>
        )}

        <SystemLogs logs={analysis.logs} />
      </section>

      {/* 우측: 프로젝트 정보 패널 */}
      <ProjectInfoPanel fileCount={activeFiles.length} isAnalyzing={analysis.isAnalyzing} />
    </div>
  );
}

/** 탭 버튼 컴포넌트 */
function TabButton({ label, isActive, onClick }: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2.5 font-mono text-xs uppercase tracking-widest transition-all
        border-b-2 -mb-[1px]
        ${isActive
          ? 'text-mint border-mint font-bold'
          : 'text-outline border-transparent hover:text-on-surface-variant hover:border-outline-variant'
        }
      `}
    >
      {label}
    </button>
  );
}
