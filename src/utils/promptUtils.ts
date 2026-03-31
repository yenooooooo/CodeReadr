/**
 * 프롬프트 공통 유틸리티
 * promptTemplates.ts와 promptTemplatesAdvanced.ts에서 공유한다.
 * 파일 내용을 압축하여 토큰 사용량을 절약한다.
 */

import type { ProjectFile } from '@/types/project';

/** 파일당 최대 줄 수 (이보다 긴 파일은 앞부분만 전송) */
const MAX_LINES_PER_FILE = 80;

/** 전체 파일 합산 최대 문자 수 (약 30,000자 ≈ 10,000 토큰) */
const MAX_TOTAL_CHARS = 30000;

/**
 * 파일 내용에서 불필요한 부분을 제거하여 토큰을 절약한다.
 * - 빈 줄 연속 제거 (최대 1줄로)
 * - 순수 주석 줄 제거 (코드 옆 인라인 주석은 유지)
 * - 긴 파일은 앞부분만 잘라서 포함
 * @param content - 원본 파일 내용
 * @returns 압축된 파일 내용
 */
function compressContent(content: string): string {
  const lines = content.split('\n');

  const compressed = lines
    // 순수 주석 줄 제거 (// 또는 # 또는 /* */ 블록은 유지하되 단독 주석 줄 제거)
    .filter((line) => {
      const trimmed = line.trim();
      // 빈 줄은 일단 유지 (아래에서 연속 빈 줄 처리)
      if (!trimmed) return true;
      // 순수 한 줄 주석 제거
      if (trimmed.startsWith('//') && !trimmed.includes('TODO')) return false;
      if (trimmed.startsWith('#') && !trimmed.startsWith('#!')) return false;
      if (trimmed.startsWith('*') && !trimmed.startsWith('*/')) return false;
      if (trimmed.startsWith('/**') || trimmed.startsWith('*/')) return false;
      return true;
    })
    // 연속 빈 줄을 1줄로 압축
    .reduce<string[]>((acc, line) => {
      if (line.trim() === '' && acc.length > 0 && acc[acc.length - 1].trim() === '') {
        return acc;
      }
      acc.push(line);
      return acc;
    }, []);

  // 긴 파일은 앞부분만 포함 + 생략 표시
  if (compressed.length > MAX_LINES_PER_FILE) {
    return compressed.slice(0, MAX_LINES_PER_FILE).join('\n')
      + `\n... (${compressed.length - MAX_LINES_PER_FILE}줄 생략)`;
  }

  return compressed.join('\n');
}

/**
 * 프로젝트 파일 목록을 프롬프트에 삽입할 수 있는 텍스트로 변환한다.
 * 토큰 절약을 위해 각 파일 내용을 압축하고,
 * 전체 합산 문자 수가 제한을 초과하면 파일을 생략한다.
 * @param files - 프로젝트 파일 배열
 * @returns 파일 경로 + 압축된 내용을 연결한 문자열
 */
export function formatFilesForPrompt(files: ProjectFile[]): string {
  const parts: string[] = [];
  let totalChars = 0;

  for (const f of files) {
    const compressed = compressContent(f.content);

    // 전체 문자 수 제한 체크
    if (totalChars + compressed.length > MAX_TOTAL_CHARS) {
      parts.push(`--- 파일: ${f.path} --- (내용 생략, 토큰 제한)`);
      continue;
    }

    parts.push(`--- 파일: ${f.path} ---\n${compressed}`);
    totalChars += compressed.length;
  }

  return parts.join('\n\n');
}
