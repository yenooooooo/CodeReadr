/**
 * 프롬프트 공통 유틸리티
 * promptTemplates.ts와 promptTemplatesAdvanced.ts에서 공유한다.
 */

import type { ProjectFile } from '@/types/project';

/**
 * 프로젝트 파일 목록을 프롬프트에 삽입할 수 있는 텍스트로 변환한다.
 * @param files - 프로젝트 파일 배열
 * @returns 파일 경로 + 내용을 연결한 문자열
 */
export function formatFilesForPrompt(files: ProjectFile[]): string {
  return files
    .map((f) => `--- 파일: ${f.path} ---\n${f.content}`)
    .join('\n\n');
}
