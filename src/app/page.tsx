/**
 * 메인 페이지 (파일 업로드) — Logical Architect 디자인
 * ClientOnly로 감싸서 SSR 하이드레이션 불일치 방지.
 */

import { ClientOnly } from '@/components/layout/ClientOnly';
import { HomeClient } from '@/components/upload/HomeClient';
import { PageLoading } from '@/components/ui/LoadingSkeleton';

/** 메인 페이지 */
export default function HomePage() {
  return (
    <ClientOnly fallback={<PageLoading message="Loading workspace..." />}>
      <HomeClient />
    </ClientOnly>
  );
}
