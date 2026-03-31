/**
 * 학습 단계 페이지 (/learn/step/[id])
 * ClientOnly로 감싸서 SSR 하이드레이션 불일치 방지.
 */

import { ClientOnly } from '@/components/layout/ClientOnly';
import { StepClient } from '@/components/learning/StepClient';
import { PageLoading } from '@/components/ui/LoadingSkeleton';

/** 학습 단계 페이지 props */
interface StepPageProps {
  params: Promise<{ id: string }>;
}

/** 학습 단계 페이지 */
export default async function StepPage({ params }: StepPageProps) {
  const { id } = await params;
  return (
    <ClientOnly fallback={<PageLoading message="Loading step..." />}>
      <StepClient stepId={id} />
    </ClientOnly>
  );
}
