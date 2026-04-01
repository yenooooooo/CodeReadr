/**
 * 분석 중 오버레이 컴포넌트
 * Execute Analysis 클릭 후 Gemini 분석이 진행되는 동안
 * 업로드 영역 위에 단계별 진행 상태를 표시한다.
 */

'use client';

import { useState, useEffect } from 'react';

/** 분석 단계별 메시지 (순환 표시) */
const ANALYSIS_MESSAGES = [
  { icon: '🔍', text: '프로젝트 구조를 분석하고 있어요...' },
  { icon: '🧱', text: '사용된 기술 스택을 식별하고 있어요...' },
  { icon: '📂', text: '파일 간 관계를 파악하고 있어요...' },
  { icon: '🗺️', text: '학습 커리큘럼을 구성하고 있어요...' },
  { icon: '✨', text: '거의 다 됐어요! 마무리 중...' },
];

/** AnalysisOverlay props */
interface AnalysisOverlayProps {
  /** 분석 진행 중 여부 */
  isActive: boolean;
}

/** 분석 진행 오버레이 */
export function AnalysisOverlay({ isActive }: AnalysisOverlayProps) {
  const [step, setStep] = useState(0); // 현재 메시지 인덱스
  const [progress, setProgress] = useState(0); // 프로그레스 바 (0~100)

  // 5초마다 메시지 전환 + 프로그레스 증가
  useEffect(() => {
    if (!isActive) { setStep(0); setProgress(0); return; }

    const msgInterval = setInterval(() => {
      setStep((s) => (s + 1) % ANALYSIS_MESSAGES.length);
    }, 5000);

    const progInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 90));
    }, 500);

    return () => { clearInterval(msgInterval); clearInterval(progInterval); };
  }, [isActive]);

  if (!isActive) return null;

  const current = ANALYSIS_MESSAGES[step];

  return (
    <div className="flex-1 min-h-[300px] bg-surface-container-low border border-outline-variant flex flex-col items-center justify-center gap-8">
      {/* 펄스 스피너 — 정사각형 테두리가 순서대로 밝아짐 */}
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* 배경 사각형 */}
          <rect x="1" y="1" width="78" height="78" fill="none" stroke="#474750" strokeWidth="2" />
          {/* 애니메이션 사각형 — stroke-dasharray로 테두리를 따라 이동 */}
          <rect
            x="1" y="1" width="78" height="78"
            fill="none" stroke="#4de082" strokeWidth="2"
            strokeDasharray="80 232"
            className="animate-[scan_2s_linear_infinite]"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {current.icon}
        </div>
      </div>

      {/* 단계별 메시지 */}
      <div className="text-center">
        <p className="text-on-surface font-medium text-sm mb-2 transition-all duration-500">
          {current.text}
        </p>
        <p className="text-outline font-mono text-[10px] uppercase">
          AI Engine Processing — Please Wait
        </p>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-64">
        <div className="w-full bg-surface-container-high h-1.5">
          <div
            className="h-full bg-mint transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] font-mono text-outline">0%</span>
          <span className="text-[9px] font-mono text-mint">{progress}%</span>
          <span className="text-[9px] font-mono text-outline">100%</span>
        </div>
      </div>
    </div>
  );
}
