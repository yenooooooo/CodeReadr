/**
 * Step1ProjectScan 보조 컴포넌트 모음
 * FolderTreeNode, FileDetailCard, ImportanceBadge, FileRoleTable을
 * 별도 파일로 분리하여 150줄 제한을 준수한다.
 */

import type { FolderNode, FileRole } from '@/types/project';

/** FolderTreeNode 컴포넌트 props */
export interface FolderTreeNodeProps {
  /** 현재 폴더/파일 노드 */
  node: FolderNode;
  /** 트리 깊이 (들여쓰기 계산용) */
  depth: number;
  /** 현재 선택된 파일 경로 */
  selectedFile: string | null;
  /** 파일 선택 콜백 */
  onSelect: (path: string) => void;
}

/** FileDetailCard 컴포넌트 props */
export interface FileDetailCardProps {
  /** 표시할 파일 역할 정보 */
  role: FileRole;
}

/** ImportanceBadge 컴포넌트 props */
export interface ImportanceBadgeProps {
  /** 중요도 등급 (1: 핵심, 2: 보조, 3: 설정) */
  importance: 1 | 2 | 3;
}

/** FileRoleTable 컴포넌트 props */
export interface FileRoleTableProps {
  /** 파일 역할 목록 */
  roles: FileRole[];
  /** 파일 선택 콜백 */
  onSelect: (path: string) => void;
}

/**
 * 중요도 뱃지 — 파일의 중요도를 CORE / SUPPORT / CONFIG 라벨로 표시한다.
 * @param importance - 1(핵심), 2(보조), 3(설정)
 */
export function ImportanceBadge({ importance }: ImportanceBadgeProps) {
  // 등급별 라벨 매핑
  const labels = { 1: 'CORE', 2: 'SUPPORT', 3: 'CONFIG' } as const;
  // 등급별 색상 매핑
  const colors = {
    1: 'text-mint bg-mint/10 border-mint/20',
    2: 'text-on-surface-variant bg-secondary-container border-outline-variant/30',
    3: 'text-outline bg-surface-container border-outline-variant/20',
  };

  return (
    <span className={`text-[9px] font-mono px-2 py-0.5 border ${colors[importance]}`}>
      {labels[importance]}
    </span>
  );
}

/**
 * 폴더 트리 노드 (재귀) — 파일 탐색기에서 폴더/파일을 트리 형태로 렌더링한다.
 * @param node - 현재 폴더 또는 파일 노드
 * @param depth - 현재 트리 깊이 (들여쓰기 px 계산에 사용)
 * @param selectedFile - 하이라이트할 선택된 파일 경로
 * @param onSelect - 파일 클릭 시 호출되는 콜백
 */
export function FolderTreeNode({ node, depth, selectedFile, onSelect }: FolderTreeNodeProps) {
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

/**
 * 파일 상세 카드 — 선택된 파일의 경로, 역할, 중요도를 표시한다.
 * @param role - 표시할 파일 역할 정보
 */
export function FileDetailCard({ role }: FileDetailCardProps) {
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

/**
 * 파일 역할 테이블 — 모든 파일의 역할을 리스트 형태로 보여준다.
 * @param roles - 파일 역할 배열
 * @param onSelect - 행 클릭 시 해당 파일을 선택하는 콜백
 */
export function FileRoleTable({ roles, onSelect }: FileRoleTableProps) {
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
