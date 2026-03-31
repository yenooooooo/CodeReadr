/**
 * 사이드바 아이콘 + 링크 헬퍼 컴포넌트
 * Sidebar.tsx에서 사용하는 SVG 아이콘과 링크 컴포넌트를 분리.
 */

import Link from 'next/link';

/** 사이드바 링크 props */
interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

/** 사이드바 링크 (대시보드/로드맵용) */
export function SidebarLink({ href, label, icon, isActive }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-2
        font-mono text-xs uppercase tracking-widest transition-all duration-150
        ${isActive
          ? 'border-l-2 border-mint bg-surface-container-low text-mint font-bold'
          : 'border-l-2 border-transparent text-outline opacity-80 hover:bg-surface-container-low hover:text-on-surface'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

/** 사이드바 메뉴 아이콘 (학습 단계용) */
export function SidebarIcon({ name, active }: { name: string; active: boolean }) {
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

/** 업로드 아이콘 */
export function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

/** 로드맵 아이콘 */
export function RoadmapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

/** 터미널 아이콘 (프로필 영역용) */
export function TerminalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-mint">
      <path d="M4 17l6-5-6-5M12 19h8" />
    </svg>
  );
}
