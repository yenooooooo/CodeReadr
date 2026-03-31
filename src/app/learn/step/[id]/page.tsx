/**
 * 학습 단계 페이지 (/learn/step/[id])
 * URL 파라미터로 단계 번호를 받아 해당 단계 콘텐츠를 렌더링.
 * 각 단계별 컴포넌트로 분기한다.
 */

import { StepClient } from '@/components/learning/StepClient';

/** 학습 단계 페이지 props */
interface StepPageProps {
  params: Promise<{ id: string }>;
}

/** 학습 단계 페이지 */
export default async function StepPage({ params }: StepPageProps) {
  const { id } = await params;
  return <StepClient stepId={id} />;
}
