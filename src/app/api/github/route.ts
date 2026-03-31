/**
 * GitHub 레포 zip 다운로드 프록시 API Route
 * 클라이언트 → 이 API → codeload.github.com → zip 반환.
 * 서버 사이드 요청이므로 CORS 제한을 우회한다.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/github?owner=xxx&repo=xxx
 * GitHub 공개 레포의 zip 파일을 프록시하여 반환한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  // 파라미터 검증
  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'owner와 repo 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  // main 브랜치 시도 → 실패 시 master로 재시도
  const mainUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/main`;
  let response = await fetch(mainUrl);

  if (!response.ok) {
    const masterUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/master`;
    response = await fetch(masterUrl);
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `GitHub 레포를 찾을 수 없습니다 (${response.status}).` },
      { status: response.status }
    );
  }

  // zip 바이너리를 그대로 클라이언트에 전달
  const buffer = await response.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${repo}.zip"`,
    },
  });
}
