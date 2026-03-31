/**
 * 학습 단계 완료 바 컴포넌트
 * 각 Step 하단에 표시되는 "이해 완료" 버튼.
 * 클릭 시 해당 단계를 완료 처리하고 다음 단계로 이동한다.
 */

'use client';

import { useRouter } from 'next/navigation';
import type { LearningStep } from '@/types/learning';

/** StepCompleteBar props */
interface StepCompleteBarProps {
  /** 현재 단계 번호 */
  step: LearningStep;
  /** 이미 완료했는지 여부 */
  isCompleted: boolean;
  /** 완료 처리 콜백 */
  onComplete: () => void;
}

/** 학습 단계 완료 바 */
export function StepCompleteBar({ step, isCompleted, onComplete }: StepCompleteBarProps) {
  const router = useRouter();
  const nextStep = Math.min(6, step + 1);
  const isLastStep = step === 6;

  /** 완료 버튼 클릭 */
  const handleClick = () => {
    if (!isCompleted) {
      onComplete();
    }
    // 다음 단계 또는 로드맵으로 이동
    if (isLastStep) {
      router.push('/learn');
    } else {
      router.push(`/learn/step/${nextStep}`);
    }
  };

  return (
    <div className="h-14 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between px-6 shrink-0">
      <span className="text-[10px] font-mono text-outline uppercase">
        Step {String(step).padStart(2, '0')} / 06
      </span>
      <button
        onClick={handleClick}
        className={`
          px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-all
          ${isCompleted
            ? 'bg-mint/20 text-mint border border-mint/30'
            : 'bg-mint text-on-mint hover:opacity-90 active:scale-[0.98]'
          }
        `}
      >
        {isCompleted
          ? (isLastStep ? 'Completed — Back to Roadmap' : `Completed — Go to Step ${nextStep}`)
          : (isLastStep ? 'Complete & Finish' : `Mark Complete & Next Step`)
        }
      </button>
    </div>
  );
}
