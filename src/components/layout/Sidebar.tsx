/**
 * 사이드바 컴포넌트 — Logical Architect 디자인
 * JetBrains Mono 대문자 네비게이션, Status Pillar(2px 민트 스트라이프),
 * 배경색 차이로 레이아웃 구분, 하단 엔지니어 프로필.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LEARNING_STEPS } from '@/constants';

/** 학습 단계 → Material-style 아이콘 라벨 매핑 */
const STEP_ICONS: Record<number, string> = {
  1: 'info',
  2: 'schema',
  3: 'account_tree',
  4: 'fact_check',
  5: 'warning',
  6: 'speed',
};

/** 학습 단계 → 영문 라벨 (디자인 시스템 스타일) */
const STEP_LABELS: Record<number, string> = {
  1: 'Introduction',
  2: 'Architecture',
  3: 'Data Flow',
  4: 'Logic Review',
  5: 'Edge Cases',
  6: 'Optimization',
};

/** 사이드바 네비게이션 컴포넌트 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex bg-surface w-64 h-full flex-col py-4 space-y-1 border-r border-outline-variant/50 shrink-0">
      {/* 프로젝트 워크스페이스 라벨 */}
      <div className="px-6 mb-6">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-mint">
          Project Workspace
        </h2>
        <p className="font-mono text-[10px] text-outline mt-1">
          Analysis Engine v2.4
        </p>
      </div>

      {/* 6단계 학습 네비게이션 */}
      <nav className="flex-1 space-y-1">
        {LEARNING_STEPS.map((step) => {
          const href = `/learn/step/${step.step}`;
          const isActive = pathname === href;

          return (
            <Link
              key={step.step}
              href={href}
              className={`
                flex items-center gap-3 px-6 py-2
                font-mono text-xs uppercase tracking-widest
                transition-all duration-150
                ${isActive
                  ? 'border-l-2 border-mint bg-surface-container-low text-mint font-bold'
                  : 'border-l-2 border-transparent text-outline opacity-80 hover:bg-surface-container-low hover:text-on-surface'
                }
              `}
            >
              <SidebarIcon name={STEP_ICONS[step.step]} active={isActive} />
              <span>{STEP_LABELS[step.step]}</span>
            </Link>
          );
        })}
      </nav>

      {/* 하단: 엔지니어 프로필 */}
      <div className="px-6 py-4 mt-auto border-t border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-surface-container-high border border-outline-variant/50 flex items-center justify-center">
            <TerminalIcon />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface uppercase tracking-tight">
              Engineer Profile
            </p>
            <p className="text-[9px] font-mono text-outline">
              ID: 0x4F2A
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** 사이드바 메뉴 아이콘 (SVG 아이콘 인라인) */
function SidebarIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'text-mint' : 'text-outline';
  const iconMap: Record<string, React.ReactNode> = {
    info: <circle cx="12" cy="12" r="10" />,
    schema: <><path d="M6 3v6l6 3 6-3V3" /><path d="M6 9v6l6 3 6-3V9" /></>,
    account_tree: <><path d="M12 3v6" /><path d="M8 9H4v6h4" /><path d="M16 9h4v6h-4" /><path d="M12 9v12" /></>,
    fact_check: <><rect x="3" y="3" width="18" height="18" rx="0" /><path d="M9 12l2 2 4-4" /></>,
    warning: <path d="M12 2L2 22h20L12 2zm0 7v6m0 2v2" />,
    speed: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  };

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${color} shrink-0`}>
      {iconMap[name]}
    </svg>
  );
}

/** 터미널 아이콘 (프로필 영역용) */
function TerminalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-mint">
      <path d="M4 17l6-5-6-5M12 19h8" />
    </svg>
  );
}
