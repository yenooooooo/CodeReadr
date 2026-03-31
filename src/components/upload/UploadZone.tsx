/**
 * 파일 업로드 영역 컴포넌트
 * 드래그 앤 드롭 + Browse File 버튼으로 파일 입력.
 * 드래그 중 보더 색상 변경, 업로드 후 파일 목록 표시.
 */

'use client';

import { useRef } from 'react';
import type { ProjectFile } from '@/types/project';
import type { UploadStatus } from '@/hooks/useFileUpload';

/** UploadZone props */
interface UploadZoneProps {
  /** 드래그 중 여부 */
  isDragging: boolean;
  /** 현재 업로드 상태 */
  status: UploadStatus;
  /** 파싱 완료된 파일 목록 */
  files: ProjectFile[];
  /** 에러 메시지 */
  error: string | null;
  /** 드롭 핸들러 */
  onDrop: (e: React.DragEvent) => void;
  /** 드래그오버 핸들러 */
  onDragOver: (e: React.DragEvent) => void;
  /** 드래그떠남 핸들러 */
  onDragLeave: () => void;
  /** 파일 선택 핸들러 */
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** 파일 업로드 드롭존 */
export function UploadZone({
  isDragging, status, files, error,
  onDrop, onDragOver, onDragLeave, onFileSelect,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null); // 숨겨진 파일 input 참조

  /** Browse File 버튼 클릭 시 input 트리거 */
  const handleBrowseClick = () => inputRef.current?.click();

  // 파일 파싱 완료 상태면 파일 목록 표시
  if (status === 'done' && files.length > 0) {
    return <UploadedFileList files={files} />;
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        flex-1 min-h-[300px] flex flex-col items-center justify-center gap-6
        bg-surface-container-low transition-all
        border border-dashed
        ${isDragging
          ? 'border-mint bg-mint/5'
          : 'border-outline-variant hover:bg-surface-container'
        }
        ${error ? 'border-error-red' : ''}
      `}
    >
      {/* 업로드 아이콘 */}
      <div className="w-16 h-16 bg-surface-container-high border border-outline-variant flex items-center justify-center">
        <UploadIcon />
      </div>

      {/* 안내 텍스트 또는 에러 */}
      <div className="text-center">
        {error ? (
          <p className="text-error-red text-sm mb-1">{error}</p>
        ) : status === 'parsing' ? (
          <p className="text-mint text-sm animate-pulse">파일을 읽고 있어요...</p>
        ) : (
          <>
            <p className="text-on-surface font-semibold mb-1">
              파일을 여기에 끌어다 놓거나
            </p>
            <p className="text-outline text-xs font-mono">
              SUPPORTED: .ZIP, .MD, .TS, .TSX, .JS, .JSX, .CSS, .JSON
            </p>
          </>
        )}
      </div>

      {/* Browse File 버튼 + 숨겨진 input */}
      <button
        onClick={handleBrowseClick}
        className="bg-mint text-on-mint px-6 py-2 font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
      >
        Browse File
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".ts,.tsx,.js,.jsx,.css,.json,.md,.html,.yaml,.yml"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  );
}

/** 업로드 완료 후 파일 목록 표시 */
function UploadedFileList({ files }: { files: ProjectFile[] }) {
  return (
    <div className="flex-1 min-h-[300px] bg-surface-container-low border border-outline-variant/50 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-3 bg-mint" />
        <span className="text-[10px] font-mono text-mint font-bold uppercase tracking-widest">
          Uploaded Files ({files.length})
        </span>
      </div>
      <div className="space-y-1">
        {files.map((file) => (
          <div key={file.path} className="flex items-center gap-3 px-3 py-1.5 font-mono text-xs hover:bg-surface-container-high transition-colors">
            <span className="text-mint">{'>'}</span>
            <span className="text-on-surface-variant">{file.path}</span>
            <span className="text-outline ml-auto">.{file.extension}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 업로드 파일 아이콘 */
function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mint">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  );
}
