/**
 * 하단 상태 바 컴포넌트
 * 시스템 상태 표시 + 문서/로그/터미널 링크.
 * 모든 페이지 하단에 고정(h-8) 표시된다.
 */

/** 하단 상태 바 */
export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/50 h-8 flex items-center justify-between px-6 z-50 shrink-0">
      {/* 좌측: 시스템 상태 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* 상태 표시 점 (초록 = 활성) */}
          <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          <span className="font-mono text-[10px] text-mint uppercase tracking-wider">
            System Status: AI Engine Active | v2.4.0-stable
          </span>
        </div>
      </div>

      {/* 우측: 네비게이션 링크 */}
      <div className="flex items-center gap-4">
        <button className="font-mono text-[10px] text-outline uppercase hover:text-on-surface transition-colors">
          Docs
        </button>
        <button className="font-mono text-[10px] text-outline uppercase hover:text-on-surface transition-colors">
          Logs
        </button>
        <button className="font-mono text-[10px] text-outline uppercase hover:text-on-surface transition-colors">
          Terminal
        </button>
      </div>
    </footer>
  );
}
