/**
 * 클라이언트 전용 렌더링 래퍼
 * SSR 하이드레이션 불일치(React #418)를 방지하기 위해
 * 클라이언트 마운트 후에만 children을 렌더링한다.
 * localStorage 의존 컴포넌트를 감쌀 때 사용.
 */

'use client';

import { useState, useEffect } from 'react';

/** ClientOnly props */
interface ClientOnlyProps {
  /** 마운트 후 렌더링할 컨텐츠 */
  children: React.ReactNode;
  /** 마운트 전 표시할 폴백 UI (선택) */
  fallback?: React.ReactNode;
}

/**
 * 클라이언트 마운트 후에만 children을 렌더링하는 래퍼.
 * 서버에서는 fallback(또는 빈 화면)을 렌더링하여
 * 하이드레이션 불일치를 원천 차단한다.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
