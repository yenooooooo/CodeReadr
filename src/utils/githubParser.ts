/**
 * GitHub 공개 레포 파싱 유틸리티
 * zipball 방식으로 레포 전체를 한 번에 다운로드하여
 * ProjectFile[] 형태로 변환한다. API 호출 1회로
 * rate limit 문제 없이 모든 파일을 가져온다.
 *
 * 저수준 zip 다운로드/파싱은 githubApi.ts로 분리됨.
 */

import { fetchRepoAsZip } from './githubApi';
import type { ProjectFile } from '@/types/project';

/**
 * GitHub URL에서 owner와 repo 이름을 추출한다.
 * @param url - GitHub 저장소 URL (예: "https://github.com/user/repo")
 * @returns { owner, repo } 또는 파싱 실패 시 null
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

/**
 * GitHub 공개 레포를 분석하여 ProjectFile[] 배열로 변환한다.
 * zipball 1회 다운로드로 전체 파일을 가져온다 (rate limit 무관).
 * @param url - GitHub 저장소 URL
 * @param onProgress - 진행 상황 콜백 (현재 파일 번호, 전체 파일 수)
 * @returns ProjectFile 배열
 */
export async function parseGitHubRepo(
  url: string,
  onProgress?: (current: number, total: number) => void
): Promise<ProjectFile[]> {
  // URL에서 owner/repo 추출
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error('올바른 GitHub URL 형식이 아닙니다. (예: https://github.com/user/repo)');
  }

  const { owner, repo } = parsed;

  // zipball 방식으로 전체 레포 다운로드 + 파일 추출
  const files = await fetchRepoAsZip(owner, repo, onProgress);

  if (files.length === 0) {
    throw new Error('지원되는 코드 파일을 찾을 수 없습니다.');
  }

  return files;
}
