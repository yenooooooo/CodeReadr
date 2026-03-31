/**
 * GitHub URL 입력 컴포넌트
 * URL 입력 필드 + 분석 시작 버튼.
 * GitHub REST API로 공개 레포를 가져와서 ProjectFile[]로 변환.
 */

'use client';

import { useState } from 'react';
import type { ProjectFile } from '@/types/project';
import { parseGitHubRepo, parseGitHubUrl } from '@/utils/githubParser';

/** GitHubUrlInput props */
interface GitHubUrlInputProps {
  /** 파싱 완료 시 콜백 (파일 목록 전달) */
  onFilesLoaded: (files: ProjectFile[]) => void;
  /** 에러 발생 시 콜백 */
  onError: (message: string) => void;
  /** 로그 추가 콜백 */
  onLog: (level: string, message: string) => void;
}

/** GitHub URL 입력 영역 */
export function GitHubUrlInput({ onFilesLoaded, onError, onLog }: GitHubUrlInputProps) {
  const [url, setUrl] = useState(''); // 입력된 URL
  const [isLoading, setIsLoading] = useState(false); // 로딩 중 여부
  const [progress, setProgress] = useState(''); // 진행 상황 텍스트

  // URL 유효성 검사 (입력 중 실시간)
  const parsed = url.trim() ? parseGitHubUrl(url.trim()) : null;
  const isValidUrl = parsed !== null;

  /** 분석 시작 버튼 클릭 */
  const handleFetch = async () => {
    if (!isValidUrl || isLoading) return;

    setIsLoading(true);
    setProgress('Connecting to GitHub...');
    onLog('START', `Fetching repo: ${parsed!.owner}/${parsed!.repo}`);

    try {
      const files = await parseGitHubRepo(url.trim(), (current, total) => {
        setProgress(`Downloading files... (${current}/${total})`);
        onLog('FETCH', `Downloaded ${current}/${total} files`);
      });

      onLog('OK', `Loaded ${files.length} files from GitHub.`);
      setProgress('');
      onFilesLoaded(files);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GitHub 연결에 실패했어요.';
      onLog('ERROR', message);
      onError(message);
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[300px] flex flex-col gap-6 bg-surface-container-low border border-outline-variant p-8">
      {/* 아이콘 + 안내 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 bg-surface-container-high border border-outline-variant flex items-center justify-center">
          <GitHubIcon />
        </div>
        <div className="text-center">
          <p className="text-on-surface font-semibold mb-1">
            GitHub 저장소 URL을 입력하세요
          </p>
          <p className="text-outline text-xs font-mono">
            PUBLIC REPOS ONLY | MAX 50 FILES
          </p>
        </div>

        {/* URL 입력 필드 */}
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant focus-within:border-mint transition-colors">
            <span className="pl-3 text-outline font-mono text-sm">{'>'}</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              disabled={isLoading}
              className="flex-1 bg-transparent py-3 pr-3 text-sm font-mono text-on-surface placeholder:text-outline/40 outline-none disabled:cursor-wait"
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            />
          </div>

          {/* URL 파싱 결과 미리보기 */}
          {url.trim() && (
            <p className={`mt-2 text-[10px] font-mono ${isValidUrl ? 'text-mint' : 'text-error-red'}`}>
              {isValidUrl
                ? `DETECTED: ${parsed!.owner}/${parsed!.repo}`
                : 'INVALID URL FORMAT'
              }
            </p>
          )}
        </div>

        {/* 진행 상황 표시 */}
        {progress && (
          <p className="text-mint text-sm font-mono animate-pulse">{progress}</p>
        )}
      </div>

      {/* 분석 시작 버튼 */}
      <button
        onClick={handleFetch}
        disabled={!isValidUrl || isLoading}
        className={`
          w-full py-3 font-mono font-bold text-sm uppercase tracking-widest transition-all
          ${isValidUrl && !isLoading
            ? 'bg-mint text-on-mint hover:opacity-90 active:scale-[0.99]'
            : 'bg-outline-variant/30 text-outline cursor-not-allowed'
          }
          ${isLoading ? 'animate-pulse cursor-wait' : ''}
        `}
      >
        {isLoading ? 'Fetching Repository...' : 'Fetch Repository'}
      </button>
    </div>
  );
}

/** GitHub 아이콘 (SVG) */
function GitHubIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-mint">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
