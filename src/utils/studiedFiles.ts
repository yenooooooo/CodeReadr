/**
 * 3단계 학습 완료 파일 조회 유틸리티
 * localStorage에서 codereadr_file_* 캐시 키를 검색하여
 * 유저가 이미 학습한 파일 경로 목록을 반환한다.
 * 4단계 퀴즈에서 학습한 파일만 출제하기 위해 사용.
 */

import type { ProjectFile } from '@/types/project';

/** localStorage 캐시 키 접두사 */
const FILE_CACHE_PREFIX = 'codereadr_file_';

/**
 * 3단계에서 학습 완료한 파일 경로 목록을 반환한다.
 * @returns 학습 완료된 파일 경로 배열
 */
export function getStudiedFilePaths(): string[] {
  const paths: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(FILE_CACHE_PREFIX)) {
      paths.push(key.slice(FILE_CACHE_PREFIX.length));
    }
  }
  return paths;
}

/**
 * 프로젝트 파일 중 3단계에서 학습 완료한 파일만 필터링한다.
 * @param files - 전체 프로젝트 파일 배열
 * @returns 학습 완료된 파일만 담긴 배열
 */
export function filterStudiedFiles(files: ProjectFile[]): ProjectFile[] {
  const studied = new Set(getStudiedFilePaths());
  return files.filter((f) => studied.has(f.path));
}
