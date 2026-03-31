/**
 * 상단 헤더 바 컴포넌트
 * Logical Architect 브랜딩 + 현재 파일 탭 + 설정/계정 버튼.
 * 모든 페이지 상단에 고정(h-12) 표시된다.
 */

'use client';

import { usePathname } from 'next/navigation';
import { LEARNING_STEPS } from '@/constants';

/**
 * 현재 경로에 해당하는 학습 단계 제목을 반환한다.
 * @param pathname - 현재 URL 경로
 * @returns 단계 제목 문자열 또는 기본값
 */
function getPageLabel(pathname: string): string {
  if (pathname === '/') return '파일 업로드';
  if (pathname === '/learn') return '학습 로드맵';

  // /learn/step/[id] 경로에서 단계 번호 추출
  const stepMatch = pathname.match(/\/learn\/step\/(\d+)/);
  if (stepMatch) {
    const stepNum = parseInt(stepMatch[1], 10);
    const step = LEARNING_STEPS.find((s) => s.step === stepNum);
    return step ? step.title : '학습';
  }

  if (pathname.startsWith('/quiz')) return '퀴즈';
  if (pathname.startsWith('/review')) return '코드 리뷰';
  if (pathname.startsWith('/prompt')) return '프롬프트 훈련';
  return '코드읽기';
}

/** 상단 헤더 바 */
export function Header() {
  const pathname = usePathname();
  const pageLabel = getPageLabel(pathname);

  return (
    <header className="bg-surface-container-low border-b border-outline-variant/50 flex justify-between items-center px-4 h-12 w-full z-50 shrink-0">
      {/* 좌측: 브랜딩 + 현재 페이지 탭 */}
      <div className="flex items-center gap-6">
        <span className="font-mono font-bold text-mint text-lg tracking-tighter">
          Logical Architect
        </span>
        <div className="flex items-center gap-1 font-mono text-sm">
          <span className="text-mint border-b-2 border-mint pb-0.5 px-1">
            {pageLabel}
          </span>
        </div>
      </div>

      {/* 우측: 설정 + 계정 버튼 */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-outline hover:bg-surface-container-high transition-colors">
          <SettingsIcon />
        </button>
        <button className="p-2 text-outline hover:bg-surface-container-high transition-colors">
          <AccountIcon />
        </button>
      </div>
    </header>
  );
}

/** 설정 아이콘 (Material Symbols 대체용 인라인 SVG) */
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

/** 계정 아이콘 */
function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}
