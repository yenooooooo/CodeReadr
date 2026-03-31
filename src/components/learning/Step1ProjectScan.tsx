/**
 * 1단계: 프로젝트 스캔 컴포넌트
 * 프로젝트 전체 지도(폴더 트리) + 파일별 역할 요약 + 핵심 기능 카드.
 * stitch(12) 디자인 참고: 왼쪽 파일 탐색기 + 오른쪽 설명 패널.
 *
 * 보조 UI 컴포넌트(FolderTreeNode, FileDetailCard, ImportanceBadge,
 * FileRoleTable)는 Step1Helpers.tsx로 분리됨.
 */

'use client';

import { useState } from 'react';
import type { StoredProject } from '@/types/project';
import {
  FolderTreeNode,
  FileDetailCard,
  FileRoleTable,
} from './Step1Helpers';

/** Step1 props */
interface Step1Props {
  /** 분석 완료된 프로젝트 데이터 */
  project: StoredProject;
}

/**
 * 1단계: 프로젝트 스캔 — 좌측 파일 탐색기 + 우측 설명 패널 레이아웃.
 * @param project - localStorage에서 불러온 분석 완료 프로젝트
 */
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
