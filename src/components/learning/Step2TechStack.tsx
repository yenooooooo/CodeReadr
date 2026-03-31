/**
 * 2단계: 기술 스택 학습 컴포넌트
 * 기술 스택 카드 그리드 + 클릭 시 상세 설명 패널.
 * 각 기술의 비유 설명, 프로젝트 내 사용 위치, 필요 이유를 표시.
 */

'use client';

import { useState } from 'react';
import type { StoredProject, TechStack } from '@/types/project';

/** Step2 props */
interface Step2Props {
  project: StoredProject;
}

/** 2단계: 기술 스택 학습 */
export function Step2TechStack({ project }: Step2Props) {
  const { techStack } = project;
  // 선택된 기술 (클릭 시 상세 패널 열림)
  const [selected, setSelected] = useState<TechStack | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측: 기술 스택 카드 그리드 */}
      <section className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-xl font-bold text-on-surface tracking-tight mb-2">
            기술 스택 학습
          </h1>
          <p className="text-on-surface-variant text-sm">
            이 프로젝트에 사용된 기술들을 하나씩 살펴봅니다. 카드를 클릭하면 상세 설명을 볼 수 있어요.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techStack.map((tech) => (
            <TechCard
              key={tech.name}
              tech={tech}
              isSelected={selected?.name === tech.name}
              onClick={() => setSelected(tech)}
            />
          ))}
        </div>
      </section>

      {/* 우측: 선택된 기술 상세 패널 */}
      {selected && (
        <TechDetailPanel tech={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/** 기술 스택 카드 */
function TechCard({
  tech, isSelected, onClick,
}: {
  tech: TechStack;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-left bg-surface-container-low border p-5 transition-all
        hover:bg-surface-container
        ${isSelected
          ? 'border-mint/50 bg-surface-container'
          : 'border-outline-variant/30'
        }
      `}
    >
      {/* 카테고리 + 기술명 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-mono uppercase bg-secondary-container text-on-surface-variant px-2 py-0.5">
          {tech.category}
        </span>
        <span className="text-[10px] font-mono text-mint">
          {tech.usedInFiles.length} files
        </span>
      </div>
      <h3 className="text-base font-bold text-on-surface mb-2">{tech.name}</h3>
      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
        {tech.analogyDescription}
      </p>
    </button>
  );
}

/** 기술 상세 패널 (우측) */
function TechDetailPanel({
  tech, onClose,
}: {
  tech: TechStack;
  onClose: () => void;
}) {
  return (
    <aside className="w-96 bg-surface-container-low border-l border-outline-variant/50 p-6 overflow-y-auto shrink-0">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-bold text-on-surface uppercase tracking-widest flex items-center">
          <span className="w-1 h-3 bg-mint mr-2" />
          {tech.name}
        </h2>
        <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 비유 설명 */}
      <DetailSection title="이 기술이 뭔가요?" content={tech.analogyDescription} />

      {/* 프로젝트 내 용도 */}
      <DetailSection title="이 프로젝트에서의 역할" content={tech.projectUsage} />

      {/* 사용 파일 목록 */}
      <div className="mb-6">
        <h4 className="text-[10px] font-mono text-outline uppercase mb-2">Used In Files</h4>
        <div className="space-y-1">
          {tech.usedInFiles.map((file) => (
            <div key={file} className="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant px-2 py-1 bg-surface hover:bg-surface-container-high transition-colors">
              <span className="text-mint">{'>'}</span>
              <span>{file}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 왜 필요한지 */}
      <DetailSection title="이 기술이 없으면?" content={tech.whyNeeded} />
    </aside>
  );
}

/** 상세 패널 섹션 */
function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-6">
      <h4 className="text-[10px] font-mono text-outline uppercase mb-2">{title}</h4>
      <p className="text-sm text-on-surface-variant leading-relaxed">{content}</p>
    </div>
  );
}
