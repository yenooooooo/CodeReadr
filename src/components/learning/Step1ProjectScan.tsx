/**
 * 1단계: 프로젝트 스캔 컴포넌트
 * 프로젝트 전체 지도(폴더 트리) + 파일별 역할 요약 + 핵심 기능 카드.
 * stitch(12) 디자인 참고: 왼쪽 파일 탐색기 + 오른쪽 설명 패널.
 */

'use client';

import { useState } from 'react';
import type { StoredProject, FolderNode, FileRole } from '@/types/project';

/** Step1 props */
interface Step1Props {
  project: StoredProject;
}

/** 1단계: 프로젝트 스캔 */
export function Step1ProjectScan({ project }: Step1Props) {
  const { structure } = project;
  // 선택된 파일 경로 (클릭 시 상세 표시)
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // 선택된 파일의 역할 정보
  const selectedRole = structure.fileRoles.find((f) => f.path === selectedFile);

  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측: 폴더 트리 */}
      <aside className="w-80 bg-surface border-r border-outline-variant/30 flex flex-col shrink-0">
        <div className="h-10 px-4 flex items-center border-b border-outline-variant/30 bg-surface-container-low">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
            파일 탐색기
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 font-mono text-[12px]">
          {structure.folderTree.map((node) => (
            <FolderTreeNode
              key={node.name}
              node={node}
              depth={0}
              selectedFile={selectedFile}
              onSelect={setSelectedFile}
            />
          ))}
        </div>

        {/* 핵심 기능 카드 */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30">
          <h3 className="text-[10px] font-bold text-mint mb-2 uppercase tracking-tighter">
            핵심 기능
          </h3>
          <div className="space-y-1">
            {structure.keyFeatures.map((feat, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-mint font-bold text-[10px] mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-on-surface-variant text-[11px] leading-tight">
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 우측: 프로젝트 요약 + 선택된 파일 상세 */}
      <section className="flex-1 p-8 overflow-y-auto">
        {/* 프로젝트 요약 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-on-surface tracking-tight mb-2">
            프로젝트 스캔
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {structure.summary}
          </p>
        </div>

        {/* 선택된 파일 상세 정보 */}
        {selectedRole ? (
          <FileDetailCard role={selectedRole} />
        ) : (
          <div className="bg-surface-container-low border border-outline-variant/30 p-8 text-center">
            <p className="text-outline font-mono text-sm">
              왼쪽 파일 탐색기에서 파일을 클릭하면 상세 정보가 표시됩니다.
            </p>
          </div>
        )}

        {/* 전체 파일 역할 요약 테이블 */}
        <div className="mt-8">
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-widest mb-4 flex items-center">
            <span className="w-1 h-3 bg-mint mr-2" />
            파일 역할 요약
          </h2>
          <FileRoleTable roles={structure.fileRoles} onSelect={setSelectedFile} />
        </div>
      </section>
    </div>
  );
}

/** 폴더 트리 노드 (재귀) */
function FolderTreeNode({
  node, depth, selectedFile, onSelect,
}: {
  node: FolderNode;
  depth: number;
  selectedFile: string | null;
  onSelect: (path: string) => void;
}) {
  const isFolder = node.type === 'folder';
  const isSelected = !isFolder && selectedFile === node.name;

  return (
    <>
      <div
        onClick={() => !isFolder && onSelect(node.name)}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        className={`
          flex items-center gap-2 py-1 cursor-pointer transition-colors
          ${isSelected
            ? 'bg-surface-container-high text-mint border-l-2 border-mint'
            : 'text-on-surface-variant hover:bg-surface-container-high'
          }
        `}
      >
        <span className="text-[10px]">{isFolder ? '📂' : '📄'}</span>
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && node.children?.map((child) => (
        <FolderTreeNode
          key={child.name}
          node={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

/** 파일 상세 카드 */
function FileDetailCard({ role }: { role: FileRole }) {
  return (
    <div className="bg-surface-container-highest border border-mint/30 p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-3 bg-mint" />
        <span className="text-[10px] font-mono text-mint font-bold uppercase tracking-widest">
          File Detail
        </span>
      </div>
      <h3 className="font-mono text-sm text-on-surface mb-2">{role.path}</h3>
      <p className="text-on-surface-variant text-sm leading-relaxed">{role.role}</p>
      <div className="mt-3">
        <ImportanceBadge importance={role.importance} />
      </div>
    </div>
  );
}

/** 중요도 뱃지 */
function ImportanceBadge({ importance }: { importance: 1 | 2 | 3 }) {
  const labels = { 1: 'CORE', 2: 'SUPPORT', 3: 'CONFIG' } as const;
  const colors = { 1: 'text-mint bg-mint/10 border-mint/20', 2: 'text-on-surface-variant bg-secondary-container border-outline-variant/30', 3: 'text-outline bg-surface-container border-outline-variant/20' };
  return (
    <span className={`text-[9px] font-mono px-2 py-0.5 border ${colors[importance]}`}>
      {labels[importance]}
    </span>
  );
}

/** 파일 역할 테이블 */
function FileRoleTable({ roles, onSelect }: { roles: FileRole[]; onSelect: (p: string) => void }) {
  return (
    <div className="border border-outline-variant/30 bg-surface-container-lowest">
      {roles.map((role, i) => (
        <div
          key={role.path}
          onClick={() => onSelect(role.path)}
          className={`
            flex items-center gap-4 px-4 py-2 font-mono text-[11px] cursor-pointer transition-colors
            hover:bg-surface-container-high
            ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}
          `}
        >
          <ImportanceBadge importance={role.importance} />
          <span className="text-on-surface-variant flex-1 truncate">{role.path}</span>
          <span className="text-outline text-[10px] truncate max-w-[50%]">{role.role}</span>
        </div>
      ))}
    </div>
  );
}
