/**
 * 학습 메인 페이지 (/learn)
 * ClientOnly로 감싸서 SSR 하이드레이션 불일치 방지.
 */

import { ClientOnly } from '@/components/layout/ClientOnly';
import { LearnClient } from '@/components/learning/LearnClient';
import { PageLoading } from '@/components/ui/LoadingSkeleton';

/** 학습 메인 페이지 */
export default function LearnPage() {
  return (
    <ClientOnly fallback={<PageLoading message="Loading roadmap..." />}>
      <LearnClient />
    </ClientOnly>
  );
}
