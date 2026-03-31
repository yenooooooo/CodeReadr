/**
 * GitHub 공개 레포 파싱 유틸리티
 * GitHub REST API로 공개 저장소의 파일 트리와 내용을 가져와서
 * ProjectFile[] 형태로 변환한다.
 * fileParser.ts와 동일한 출력 형태를 보장하여
 * 이후 학습 단계에서 입력 방식과 무관하게 동작한다.
 */

import type { ProjectFile } from '@/types/project';
import { SUPPORTED_EXTENSIONS } from '@/constants';

/** GitHub API 트리 응답의 개별 파일 항목 */
interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

/** GitHub API 트리 응답 구조 */
interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

/**
 * GitHub URL에서 owner와 repo 이름을 추출한다.
 * @param url - GitHub 저장소 URL (예: "https://github.com/user/repo")
 * @returns { owner, repo } 또는 파싱 실패 시 null
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // https://github.com/owner/repo 또는 github.com/owner/repo 형태 지원
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

/**
 * 파일 경로가 지원되는 코드 파일인지 확인한다.
 * @param path - 파일 경로
 * @returns 지원되는 확장자이면 true
 */
function isSupportedPath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * GitHub REST API로 공개 레포의 전체 파일 트리를 가져온다.
 * @param owner - 레포 소유자
 * @param repo - 레포 이름
 * @param branch - 브랜치명 (기본: "main")
 * @returns 지원되는 코드 파일들의 경로 + SHA 목록
 */
async function fetchFileTree(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<GitHubTreeItem[]> {
  // GitHub API: 재귀적으로 전체 트리를 가져옴
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  if (!response.ok) {
    // main 브랜치 실패 시 master로 재시도
    if (branch === 'main') {
      return fetchFileTree(owner, repo, 'master');
    }
    throw new Error(`GitHub API 요청 실패 (${response.status}). 레포가 공개 저장소인지 확인해주세요.`);
  }

  const data: GitHubTreeResponse = await response.json();

  // blob(파일)만 필터링하고, 지원되는 확장자만 남김
  return data.tree.filter(
    (item) => item.type === 'blob' && isSupportedPath(item.path)
  );
}

/**
 * GitHub API로 개별 파일의 내용을 가져온다.
 * @param owner - 레포 소유자
 * @param repo - 레포 이름
 * @param path - 파일 경로
 * @returns 파일 텍스트 내용
 */
async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  if (!response.ok) return '';

  const data = await response.json();

  // GitHub API는 content를 base64로 인코딩하여 반환
  if (data.content && data.encoding === 'base64') {
    return atob(data.content.replace(/\n/g, ''));
  }

  return '';
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
