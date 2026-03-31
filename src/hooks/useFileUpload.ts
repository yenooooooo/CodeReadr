/**
 * 파일 업로드 상태 관리 훅
 * 드래그앤드롭 + 파일 선택 → 파싱 → Gemini 분석 → 결과 저장까지
 * 전체 업로드 흐름의 상태를 관리한다.
 */

'use client';

import { useState, useCallback } from 'react';
import type { ProjectFile } from '@/types/project';
import { parseFiles, getTotalSize, formatFileSize } from '@/utils/fileParser';
import { MAX_FILE_SIZE } from '@/constants';

/** 업로드 상태 */
export type UploadStatus = 'idle' | 'parsing' | 'analyzing' | 'done' | 'error';

/** 훅 반환 타입 */
interface UseFileUploadReturn {
  /** 파싱된 파일 목록 */
  files: ProjectFile[];
  /** 현재 상태 */
  status: UploadStatus;
  /** 에러 메시지 (있을 경우) */
  error: string | null;
  /** 드래그 오버 중 여부 */
  isDragging: boolean;
  /** 파일 드롭 핸들러 */
  handleDrop: (e: React.DragEvent) => void;
  /** 드래그 오버 핸들러 */
  handleDragOver: (e: React.DragEvent) => void;
  /** 드래그 떠남 핸들러 */
  handleDragLeave: () => void;
  /** 파일 선택(input) 핸들러 */
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 상태 초기화 */
  reset: () => void;
}

/**
 * 파일 업로드 상태를 관리하는 커스텀 훅.
 * @returns 업로드 관련 상태 + 핸들러 모음
 */
export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<ProjectFile[]>([]); // 파싱 완료된 파일 목록
  const [status, setStatus] = useState<UploadStatus>('idle'); // 현재 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [isDragging, setIsDragging] = useState(false); // 드래그 중 여부

  /** 파일 목록을 받아서 파싱 처리하는 공통 로직 */
  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    setError(null);
    setStatus('parsing');

    // 전체 용량 검증
    const totalSize = getTotalSize(fileList);
    if (totalSize > MAX_FILE_SIZE) {
      setError(`파일 크기가 너무 큽니다 (${formatFileSize(totalSize)}). 최대 10MB까지 업로드할 수 있어요.`);
      setStatus('error');
      return;
    }

    try {
      const parsed = await parseFiles(fileList);
      if (parsed.length === 0) {
        setError('지원되는 코드 파일이 없어요. .ts, .tsx, .js, .jsx, .css, .json 파일을 업로드해주세요.');
        setStatus('error');
        return;
      }
      setFiles(parsed);
      setStatus('done');
    } catch (err) {
      console.error('파일 파싱 에러:', err);
      setError('파일을 읽는 중 문제가 발생했어요. 다시 시도해주세요.');
      setStatus('error');
    }
  }, []);

  /** 파일 드롭 이벤트 핸들러 */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  /** 드래그 오버 이벤트 핸들러 */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  /** 드래그 떠남 이벤트 핸들러 */
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  /** input[type=file] 변경 핸들러 */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  }, [processFiles]);

  /** 상태 전체 초기화 */
  const reset = useCallback(() => {
    setFiles([]);
    setStatus('idle');
    setError(null);
    setIsDragging(false);
  }, []);

  return {
    files, status, error, isDragging,
    handleDrop, handleDragOver, handleDragLeave,
    handleFileSelect, reset,
  };
}
