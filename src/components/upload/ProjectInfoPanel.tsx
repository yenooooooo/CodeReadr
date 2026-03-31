/**
 * 프로젝트 정보 사이드 패널 컴포넌트
 * 우측에 Total Files, Key Features, Frameworks 표시.
 * 업로드 전/후 상태에 따라 다른 내용을 보여준다.
 */

/** ProjectInfoPanel props */
interface ProjectInfoPanelProps {
  /** 업로드된 파일 수 */
  fileCount: number;
  /** AI 분석 중 여부 */
  isAnalyzing: boolean;
}

/** 프로젝트 정보 패널 (우측 사이드) */
export function ProjectInfoPanel({ fileCount, isAnalyzing }: ProjectInfoPanelProps) {
  const hasFiles = fileCount > 0; // 파일 업로드 여부

  return (
    <aside className="w-full md:w-80 bg-surface-container-low border-l border-outline-variant/50 p-6 flex flex-col gap-6 shrink-0">
      {/* 섹션 헤더 — Status Pillar 패턴 */}
      <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest flex items-center">
        <span className="w-1 h-3 bg-mint mr-2" />
        프로젝트 정보
      </h3>

      {/* Total Files 메트릭 카드 */}
      <div className="bg-surface p-4 border border-outline-variant/30">
        <p className="text-[10px] font-mono text-outline uppercase mb-1">
          Total Files
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono text-on-surface">
            {hasFiles ? fileCount.toLocaleString() : '—'}
          </span>
          <span className="text-[10px] font-mono text-mint">
            {isAnalyzing ? 'ANALYZING' : hasFiles ? 'LOADED' : 'SCAN READY'}
          </span>
        </div>
      </div>

      {/* Key Features 칩 영역 */}
      <div className="bg-surface p-4 border border-outline-variant/30">
        <p className="text-[10px] font-mono text-outline uppercase mb-2">
          Key Features
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-secondary-container text-on-surface text-[9px] font-mono px-2 py-1">
            {isAnalyzing ? 'SCANNING...' : hasFiles ? 'READY_TO_SCAN' : 'AWAITING_UPLOAD'}
          </span>
        </div>
      </div>

      {/* Frameworks 진행률 영역 */}
      <div className="bg-surface p-4 border border-outline-variant/30">
        <p className="text-[10px] font-mono text-outline uppercase mb-3">
          Frameworks
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium">
                {isAnalyzing ? 'Detecting...' : '—'}
              </span>
              <span className="text-[10px] font-mono text-outline">
                {isAnalyzing ? 'SCANNING' : 'PENDING'}
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1">
              <div
                className={`h-full transition-all duration-1000 ${isAnalyzing ? 'bg-mint animate-pulse w-[60%]' : 'bg-outline-variant w-0'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 상태 표시 */}
      <div className="mt-auto pt-6 border-t border-outline-variant/30 flex items-center justify-between">
        <span className="text-xs font-bold text-on-surface uppercase tracking-widest">
          {isAnalyzing ? '분석 중' : '준비됨'}
        </span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isAnalyzing ? 'bg-mint' : 'bg-mint'}`} />
          <span className="text-[10px] font-mono text-mint uppercase">
            Active Session
          </span>
        </div>
      </div>
    </aside>
  );
}
