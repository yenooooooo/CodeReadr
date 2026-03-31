/**
 * 로딩 스켈레톤 컴포넌트 — Logical Architect 디자인
 * 데이터 로딩 중 콘텐츠 자리를 잡아주는 펄스 애니메이션 블록.
 * 다양한 프리셋(카드, 텍스트, 코드)을 지원한다.
 */

/** Skeleton 바 (단일 줄) */
function Bar({ width = '100%', height = '12px' }: { width?: string; height?: string }) {
  return (
    <div
      className="bg-surface-container-high animate-pulse"
      style={{ width, height }}
    />
  );
}

/** 전체 페이지 로딩 — 중앙 메시지 + 펄스 바 */
export function PageLoading({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="w-16 h-16 bg-surface-container-high border border-outline-variant animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 bg-mint/20" />
      </div>
      <div className="text-center">
        <p className="text-mint font-mono text-sm animate-pulse mb-2">{message}</p>
        <div className="w-48 h-1 bg-surface-container-high mx-auto overflow-hidden">
          <div className="h-full bg-mint/40 animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}

/** 카드 그리드 스켈레톤 (학습 로드맵용) */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface-container-low border border-outline-variant/30 p-6 space-y-4">
          <div className="flex justify-between">
            <Bar width="60px" />
            <Bar width="40px" />
          </div>
          <Bar width="70%" height="16px" />
          <Bar width="100%" />
          <Bar width="85%" />
          <div className="mt-4">
            <Bar height="4px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 코드 블록 스켈레톤 */
export function CodeSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/50 p-6 space-y-2">
      {[100, 85, 70, 90, 60, 80, 95, 50].map((w, i) => (
        <Bar key={i} width={`${w}%`} height="14px" />
      ))}
    </div>
  );
}

/** 데이터 없음 상태 */
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-16 h-16 bg-surface-container-high border border-outline-variant flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-outline">
          <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7" /><path d="M2 17l10 5 10-5" /><path d="M12 12v10" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-on-surface font-mono text-sm font-bold">{title}</p>
        <p className="text-outline text-xs mt-1">{description}</p>
      </div>
    </div>
  );
}

/** 에러 상태 (공통) */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-16 h-16 bg-surface-container-high border border-error-red/30 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error-red">
          <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-error-red font-mono text-sm">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 bg-mint text-on-mint px-6 py-2 font-mono text-xs font-bold uppercase hover:opacity-90 transition-all">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
