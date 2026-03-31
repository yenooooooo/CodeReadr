/**
 * 코드 뷰어 컴포넌트 — Logical Architect 디자인
 * stitch(12) 기반: 줄번호 + 코드 블록 + 하이라이트 영역.
 * 구문 강조는 키워드 기반 간이 방식으로 구현 (향후 Shiki로 교체 가능).
 */

/** CodeViewer props */
interface CodeViewerProps {
  /** 코드 문자열 */
  code: string;
  /** 파일 경로 (상단 표시용) */
  filePath: string;
  /** 하이라이트할 시작 줄 번호 (1-based, 선택) */
  highlightStart?: number;
  /** 하이라이트할 끝 줄 번호 (1-based, 선택) */
  highlightEnd?: number;
}

/** 코드 뷰어 */
export function CodeViewer({ code, filePath, highlightStart, highlightEnd }: CodeViewerProps) {
  const lines = code.split('\n');

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/50 overflow-hidden">
      {/* 파일 탭 헤더 */}
      <div className="h-10 bg-surface-container-low border-b border-outline-variant/30 flex items-center px-4 gap-2">
        <span className="w-2 h-2 bg-mint" />
        <span className="text-[11px] font-mono text-on-surface">{filePath}</span>
      </div>

      {/* 코드 영역 */}
      <div className="flex overflow-x-auto max-h-[400px] overflow-y-auto">
        {/* 줄번호 컬럼 */}
        <div className="w-12 shrink-0 text-right pr-4 py-4 text-outline/30 select-none bg-surface/30 font-mono text-[12px] leading-relaxed">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* 코드 컬럼 */}
        <div className="flex-1 py-4 px-6 font-mono text-[13px] leading-relaxed">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            // 하이라이트 영역 여부 확인
            const isHighlighted = highlightStart && highlightEnd
              && lineNum >= highlightStart && lineNum <= highlightEnd;

            return (
              <div
                key={i}
                className={isHighlighted
                  ? 'bg-mint/[0.08] border-l-2 border-mint -ml-2 pl-2'
                  : ''
                }
              >
                <HighlightedLine line={line} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * 간이 구문 강조 — 키워드를 색상 span으로 래핑.
 * JS/TS/Python 공통 키워드를 처리한다.
 */
function HighlightedLine({ line }: { line: string }) {
  if (!line.trim()) return <div className="h-[1.625em]">&nbsp;</div>;

  // 주석 처리 (//, #, /* */)
  const commentMatch = line.match(/^(\s*)(\/\/.*|#.*)$/);
  if (commentMatch) {
    return (
      <div>
        <span>{commentMatch[1]}</span>
        <span className="text-outline">{commentMatch[2]}</span>
      </div>
    );
  }

  // 키워드 기반 간이 하이라이팅
  const highlighted = line
    .replace(/(import|from|export|default|const|let|var|function|return|if|else|for|while|async|await|class|new|throw|try|catch|def|yield|raise)\b/g,
      '<kw>$1</kw>')
    .replace(/(["'`])([^"'`]*)\1/g, '<str>$1$2$1</str>');

  // HTML 파싱하여 렌더링
  const parts = highlighted.split(/(<kw>.*?<\/kw>|<str>.*?<\/str>)/);

  return (
    <div className="text-on-surface-variant">
      {parts.map((part, i) => {
        if (part.startsWith('<kw>')) {
          return <span key={i} className="text-mint-dim">{part.replace(/<\/?kw>/g, '')}</span>;
        }
        if (part.startsWith('<str>')) {
          return <span key={i} className="text-on-secondary-container">{part.replace(/<\/?str>/g, '')}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
