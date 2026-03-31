/**
 * 시스템 로그 컴포넌트
 * 업로드/분석 과정의 로그를 실시간으로 표시한다.
 * 고밀도 모노스페이스 텍스트, 교대 배경색 패턴.
 */

/** 로그 항목 타입 */
interface LogItem {
  time: string;
  level: string;
  message: string;
}

/** SystemLogs props */
interface SystemLogsProps {
  /** 로그 항목 배열 (최신 항목이 맨 위) */
  logs: LogItem[];
}

/** 시스템 로그 패널 */
export function SystemLogs({ logs }: SystemLogsProps) {
  return (
    <div className="mt-8 border border-outline-variant/50 bg-surface-container-lowest">
      {/* 로그 헤더 */}
      <div className="bg-surface-container-high px-4 py-2 border-b border-outline-variant/50 flex justify-between items-center">
        <span className="text-[10px] font-mono text-mint font-bold uppercase tracking-widest">
          System Logs
        </span>
        <span className="text-[10px] font-mono text-outline">
          ENTRIES: {logs.length}
        </span>
      </div>

      {/* 로그 항목들 */}
      <div className="p-4 space-y-1 overflow-x-auto max-h-48 overflow-y-auto">
        {logs.map((log, i) => (
          <LogEntry key={i} time={log.time} level={log.level} message={log.message} />
        ))}
      </div>
    </div>
  );
}

/** 로그 레벨별 색상 매핑 */
function getLevelColor(level: string): string {
  if (level === 'ERROR') return 'text-error-red';
  if (level === 'OK' || level === 'DONE') return 'text-mint';
  if (level === 'START' || level === 'SCAN') return 'text-mint-dim';
  return 'text-mint';
}

/** 개별 로그 항목 */
function LogEntry({ time, level, message }: LogItem) {
  return (
    <div className="flex gap-4 font-mono text-[11px]">
      <span className="text-outline shrink-0">[{time}]</span>
      <span className={`${getLevelColor(level)} shrink-0`}>{level}</span>
      <span className="text-on-surface-variant italic">{message}</span>
    </div>
  );
}
