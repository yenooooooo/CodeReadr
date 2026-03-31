/**
 * GitHub REST API 저수준 호출 함수
 * 파일 트리 가져오기, 개별 파일 내용 가져오기를 담당한다.
 * githubParser.ts에서 사용하는 내부 모듈.
 */

import { SUPPORTED_EXTENSIONS } from '@/constants';

/** GitHub API 트리 응답의 개별 파일 항목 */
export interface GitHubTreeItem {
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
 * 파일 경로가 지원되는 코드 파일인지 확인한다.
 * @param path - 파일 경로
 */
function isSupportedPath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * GitHub REST API로 공개 레포의 전체 파일 트리를 가져온다.
 * main 브랜치 실패 시 master로 자동 재시도한다.
 * @param owner - 레포 소유자
 * @param repo - 레포 이름
 * @param branch - 브랜치명 (기본: "main")
 * @returns 지원되는 코드 파일들의 목록
 */
export async function fetchFileTree(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<GitHubTreeItem[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  if (!response.ok) {
    if (branch === 'main') {
      return fetchFileTree(owner, repo, 'master');
    }
    throw new Error(`GitHub API 요청 실패 (${response.status}). 레포가 공개 저장소인지 확인해주세요.`);
  }

  // 응답 JSON 파싱 (비정상 응답 시 안전하게 처리)
  let data: GitHubTreeResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error('GitHub API 응답을 파싱할 수 없습니다.');
  }

  if (!Array.isArray(data.tree)) {
    throw new Error('GitHub API에서 파일 트리를 받지 못했습니다.');
  }

  return data.tree.filter(
    (item) => item.type === 'blob' && isSupportedPath(item.path)
  );
}

/**
 * GitHub API로 개별 파일의 내용을 가져온다.
 * 실패 시 빈 문자열을 반환하여 배치 전체 실패를 방지한다.
 * @param owner - 레포 소유자
 * @param repo - 레포 이름
 * @param path - 파일 경로
 * @returns 파일 텍스트 내용
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  if (!response.ok) return '';

  let data: { content?: string; encoding?: string };
  try {
    data = await response.json();
  } catch {
    return '';
  }

  if (data.content && data.encoding === 'base64') {
    try {
      return atob(data.content.replace(/\n/g, ''));
    } catch {
      console.error(`base64 디코딩 실패: ${path}`);
      return '';
    }
  }

  return '';
}
