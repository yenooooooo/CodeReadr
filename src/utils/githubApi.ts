/**
 * GitHub REST API — zipball 방식
 * 레포 전체를 zip으로 한 번에 다운로드하여 파일을 추출한다.
 * API 호출 1회로 모든 파일을 가져오므로 rate limit 문제가 없다.
 */

import JSZip from 'jszip';
import type { ProjectFile } from '@/types/project';
import { SUPPORTED_EXTENSIONS } from '@/constants';

/**
 * Next.js API Route 프록시를 통해 GitHub 레포 zip을 다운로드한다.
 * 서버 사이드에서 codeload.github.com을 호출하므로 CORS 문제 없음.
 * 브랜치 폴백(main→master)은 API Route에서 처리한다.
 */
async function fetchZipViaProxy(owner: string, repo: string): Promise<Response> {
  return fetch(`/api/github?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
}

/**
 * 파일 경로가 지원되는 코드 파일인지 확인한다.
 * @param path - 파일 경로
 */
function isSupportedFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * zip 내부 경로에서 레포 루트 접두사를 제거한다.
 * GitHub zipball은 "{owner}-{repo}-{sha}/" 접두사가 붙는다.
 * @param zipPath - zip 내부 전체 경로
 * @returns 레포 기준 상대 경로
 */
function stripZipPrefix(zipPath: string): string {
  // 첫 번째 '/' 이후가 실제 레포 경로
  const idx = zipPath.indexOf('/');
  return idx >= 0 ? zipPath.slice(idx + 1) : zipPath;
}

/**
 * GitHub 공개 레포를 zipball로 다운로드하여 ProjectFile[] 배열로 변환한다.
 * API 호출 1회 (zipball 다운로드)로 전체 파일을 가져온다.
 * @param owner - 레포 소유자
 * @param repo - 레포 이름
 * @param onProgress - 진행 상황 콜백
 * @returns ProjectFile 배열
 */
export async function fetchRepoAsZip(
  owner: string,
  repo: string,
  onProgress?: (current: number, total: number) => void
): Promise<ProjectFile[]> {
  // Next.js API Route 프록시 경유 (CORS 우회 + rate limit 무관)
  const response = await fetchZipViaProxy(owner, repo);

  if (!response.ok) {
    throw new Error(
      `GitHub 레포 다운로드 실패 (${response.status}). 공개 저장소인지 확인해주세요.`
    );
  }

  // zip 바이너리를 ArrayBuffer로 읽기
  const buffer = await response.arrayBuffer();

  // JSZip으로 zip 파싱
  const zip = await JSZip.loadAsync(buffer);

  // zip 내부에서 지원되는 코드 파일만 필터링
  const entries: { path: string; file: JSZip.JSZipObject }[] = [];
  zip.forEach((relativePath, file) => {
    // 디렉토리는 건너뛰기
    if (file.dir) return;
    const cleanPath = stripZipPrefix(relativePath);
    // node_modules, .git 등 제외
    if (cleanPath.startsWith('node_modules/')) return;
    if (cleanPath.startsWith('.git/')) return;
    if (cleanPath.startsWith('.next/')) return;
    // 지원되는 확장자만 포함
    if (isSupportedFile(cleanPath)) {
      entries.push({ path: cleanPath, file });
    }
  });

  const total = entries.length;
  const results: ProjectFile[] = [];

  // 각 파일 내용을 텍스트로 추출
  for (let i = 0; i < entries.length; i++) {
    const { path, file } = entries[i];
    try {
      const content = await file.async('string');
      results.push({
        path,
        content,
        extension: path.split('.').pop()?.toLowerCase() || '',
        size: content.length,
      });
    } catch {
      // 바이너리 파일 등 텍스트 변환 실패 시 건너뛰기
    }
    onProgress?.(i + 1, total);
  }

  return results;
}
