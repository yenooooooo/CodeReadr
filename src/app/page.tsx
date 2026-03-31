/**
 * 메인 페이지 (파일 업로드) — Logical Architect 디자인
 * 레이아웃 + 데이터 페칭만 담당, UI는 컴포넌트로 분리.
 */

import { HomeClient } from '@/components/upload/HomeClient';

/** 메인 페이지 (서버 컴포넌트 — 클라이언트로 위임) */
export default function HomePage() {
  return <HomeClient />;
}
