/**
 * GitHub 레포 zip 다운로드 프록시 API Route
 * 클라이언트 → 이 API → codeload.github.com → zip 반환.
 * 입력 검증, rate limiting, SSRF 방지 포함.
 */

import { NextRequest, NextResponse } from 'next/server';

/** owner/repo 허용 패턴 (영문, 숫자, 하이픈, 언더스코어, 점) */
const OWNER_REGEX = /^[a-zA-Z0-9_-]{1,39}$/;
const REPO_REGEX = /^[a-zA-Z0-9_.-]{1,100}$/;

/** IP 기반 rate limit (시간당 20회) */
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 3_600_000; // 1시간

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

/** 최대 zip 크기 (50MB) */
const MAX_ZIP_SIZE = 50 * 1024 * 1024;

/**
 * GET /api/github?owner=xxx&repo=xxx
 * GitHub 공개 레포의 zip 파일을 프록시하여 반환한다.
 */
export async function GET(request: NextRequest) {
  // Rate limit 체크
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 1시간 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  // 파라미터 존재 검증
  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'owner와 repo 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  // 입력 형식 검증 (SSRF 방지)
  if (!OWNER_REGEX.test(owner) || !REPO_REGEX.test(repo)) {
    return NextResponse.json(
      { error: '올바르지 않은 owner 또는 repo 형식입니다.' },
      { status: 400 }
    );
  }

  // main 브랜치 시도 → 실패 시 master로 재시도
  const mainUrl = `https://codeload.github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/zip/refs/heads/main`;
  let response = await fetch(mainUrl);

  if (!response.ok) {
    const masterUrl = `https://codeload.github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/zip/refs/heads/master`;
    response = await fetch(masterUrl);
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `GitHub 레포를 찾을 수 없습니다 (${response.status}).` },
      { status: response.status }
    );
  }

  // 응답 크기 검증
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_ZIP_SIZE) {
    return NextResponse.json(
      { error: '레포 크기가 너무 큽니다 (최대 50MB).' },
      { status: 413 }
    );
  }

  // zip 바이너리를 그대로 클라이언트에 전달
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_ZIP_SIZE) {
    return NextResponse.json(
      { error: '레포 크기가 너무 큽니다 (최대 50MB).' },
      { status: 413 }
    );
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${repo}.zip"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
