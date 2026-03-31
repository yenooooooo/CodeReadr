/**
 * GitHub 공개 레포 파싱 유틸리티
 * GitHub REST API로 공개 저장소의 파일 트리와 내용을 가져와서
 * ProjectFile[] 형태로 변환한다.
 * fileParser.ts와 동일한 출력 형태를 보장하여
 * 이후 학습 단계에서 입력 방식과 무관하게 동작한다.
 *
 * 저수준 API 호출은 githubApi.ts로 분리됨.
 */

import type { ProjectFile } from '@/types/project';
import { fetchFileTree, fetchFileContent } from './githubApi';

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
 * fileParser.ts의 parseFiles()와 동일한 출력 형태를 보장한다.
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

  // 파일 트리 가져오기
  const treeItems = await fetchFileTree(owner, repo);

  if (treeItems.length === 0) {
    throw new Error('지원되는 코드 파일을 찾을 수 없습니다.');
  }

  // 파일 수 제한 (API 호출 횟수 제한 대비, 최대 50개)
  const MAX_FILES = 50;
  const filesToFetch = treeItems.slice(0, MAX_FILES);

  // 각 파일 내용 가져오기 (병렬 처리, 5개씩 배치)
  const BATCH_SIZE = 5;
  const results: ProjectFile[] = [];

  for (let i = 0; i < filesToFetch.length; i += BATCH_SIZE) {
    const batch = filesToFetch.slice(i, i + BATCH_SIZE);
    const contents = await Promise.all(
      batch.map((item) => fetchFileContent(owner, repo, item.path))
    );

    batch.forEach((item, j) => {
      if (contents[j]) {
        results.push({
          path: item.path,
          content: contents[j],
          extension: item.path.split('.').pop()?.toLowerCase() || '',
          size: item.size || contents[j].length,
        });
      }
    });

    onProgress?.(Math.min(i + BATCH_SIZE, filesToFetch.length), filesToFetch.length);
  }

  return results;
}
