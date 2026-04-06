/**
 * 파일 읽기/파싱 유틸리티
 * 업로드된 파일을 텍스트로 변환하고, 코드 파일을 필터링한다.
 */

import type { ProjectFile } from '@/types/project';
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } from '@/constants';

/**
 * 파일 확장자가 지원되는 코드 파일인지 확인한다.
 * @param fileName - 파일명 (예: "page.tsx")
 * @returns 지원되는 확장자이면 true
 */
export function isSupportedFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(extension);
}

/**
 * 파일명에서 확장자를 추출한다.
 * @param fileName - 파일명
 * @returns 확장자 문자열 (점 제외)
 */
export function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * File 객체를 텍스트 문자열로 읽어온다.
 * @param file - 브라우저 File 객체
 * @returns 파일 내용 텍스트
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`파일 읽기 실패: ${file.name}`));
    reader.readAsText(file);
  });
}

/**
 * 업로드된 File 객체들을 ProjectFile 배열로 변환한다.
 * 지원되지 않는 파일은 자동으로 필터링한다.
 * @param files - 브라우저 FileList 또는 File 배열
 * @returns 파싱된 ProjectFile 배열
 */
export async function parseFiles(
  files: FileList | File[]
): Promise<ProjectFile[]> {
  const fileArray = Array.from(files);
  const parsed: ProjectFile[] = [];

  for (const file of fileArray) {
    // 지원되지 않는 파일은 건너뛰기
    if (!isSupportedFile(file.name)) continue;

    // 파일 크기 확인
    if (file.size > MAX_FILE_SIZE) continue;

    try {
      const content = await readFileAsText(file);
      parsed.push({
        path: file.webkitRelativePath || file.name,
        content,
        extension: getExtension(file.name),
        size: file.size,
      });
    } catch (error) {
      console.error(`파일 파싱 실패: ${file.name}`, error);
    }
  }

  return parsed;
}

/** 코드 파일 확장자 */
const CODE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'css'];

/**
 * 프로젝트에 코드 파일이 하나도 없는 문서 전용 프���젝트인지 판별한다.
 * @param files - 프로젝트 파일 배열
 * @returns 코드 파일이 없으면 true
 */
export function isDocOnlyProject(files: { extension: string }[]): boolean {
  return files.every((f) => !CODE_EXTENSIONS.includes(f.extension));
}

/**
 * 전체 파일 크기 합계를 계산한다.
 * @param files - FileList 또는 File 배열
 * @returns 총 바이트 수
 */
export function getTotalSize(files: FileList | File[]): number {
  return Array.from(files).reduce((total, file) => total + file.size, 0);
}

/**
 * 바이트 수를 사람이 읽기 쉬운 형식으로 변환한다.
 * @param bytes - 바이트 수
 * @returns 포맷팅된 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
