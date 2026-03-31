/**
 * 원형 점수 게이지 컴포넌트 — stitch(14) 기반
 * SVG 원형 진행률 바 + 중앙 점수 텍스트.
 * 퀴즈(4단계), 코드 리뷰(5단계)에서 공통 사용.
 */

/** ScoreGauge props */
interface ScoreGaugeProps {
  /** 점수 (0~100) */
  score: number;
}

/** 원형 점수 게이지 */
export function ScoreGauge({ score }: ScoreGaugeProps) {
  // SVG 원의 둘레 계산 (반지름 70)
  const circumference = 2 * Math.PI * 70;
  // 점수에 따른 stroke-dashoffset (시계방향 채움)
  const offset = circumference - (score / 100) * circumference;

  // 점수 구간별 색상
  const color = score >= 80 ? '#4de082' : score >= 50 ? '#abaab5' : '#ee7d77';

  return (
    <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        {/* 배경 원 */}
        <circle
          cx="80" cy="80" r="70"
          fill="none"
          stroke="#25252d"
          strokeWidth="4"
        />
        {/* 진행률 원 */}
        <circle
          cx="80" cy="80" r="70"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>

      {/* 중앙 점수 텍스트 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-extrabold" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] text-outline border-t border-outline-variant pt-1 mt-1">
          INDEX_VAL / 100
        </span>
      </div>
    </div>
  );
}
