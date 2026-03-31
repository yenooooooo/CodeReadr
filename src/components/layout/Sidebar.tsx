/**
 * 사이드바 컴포넌트 — Logical Architect 디자인
 * 상단: 파일 업로드 + 로드맵 링크
 * 중앙: 6단계 학습 네비게이션 (Status Pillar 패턴)
 * 하단: 엔지니어 프로필
 * 아이콘/링크 헬퍼는 SidebarIcons.tsx로 분리됨.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LEARNING_STEPS } from '@/constants';
import {
  SidebarLink, SidebarIcon, UploadIcon, RoadmapIcon, TerminalIcon,
} from './SidebarIcons';

/** 학습 단계 → 영문 라벨 (디자인 시스템 스타일) */
const STEP_LABELS: Record<number, string> = {
  1: 'Introduction',
  2: 'Architecture',
  3: 'Data Flow',
  4: 'Logic Review',
  5: 'Edge Cases',
  6: 'Optimization',
};

/** 학습 단계 → 아이콘 이름 매핑 */
const STEP_ICONS: Record<number, string> = {
  1: 'info', 2: 'schema', 3: 'account_tree',
  4: 'fact_check', 5: 'warning', 6: 'speed',
};

/** 사이드바 네비게이션 컴포넌트 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex bg-surface w-64 h-full flex-col py-4 space-y-1 border-r border-outline-variant/50 shrink-0">
      {/* 프로젝트 워크스페이스 라벨 */}
      <div className="px-6 mb-4">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-mint">
          Project Workspace
        </h2>
        <p className="font-mono text-[10px] text-outline mt-1">
          Analysis Engine v2.4
        </p>
      </div>

      {/* 상단 네비게이션: 대시보드 + 로드맵 */}
      <nav className="px-2 mb-4 space-y-1">
        <SidebarLink href="/" label="File Upload" icon={<UploadIcon />} isActive={pathname === '/'} />
        <SidebarLink href="/learn" label="Roadmap" icon={<RoadmapIcon />} isActive={pathname === '/learn'} />
      </nav>

      <div className="mx-6 border-t border-outline-variant/30 mb-4" />

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
                font-mono text-xs uppercase tracking-widest transition-all duration-150
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
            <p className="text-[9px] font-mono text-outline">ID: 0x4F2A</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
