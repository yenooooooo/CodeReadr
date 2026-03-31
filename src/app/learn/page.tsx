/**
 * 학습 메인 페이지 (/learn)
 * 6단계 학습 로드맵 + 프로젝트 전체 지도 표시.
 * 레이아웃만 담당, UI는 컴포넌트로 분리.
 */

import { LearnClient } from '@/components/learning/LearnClient';

/** 학습 메인 페이지 */
export default function LearnPage() {
  return <LearnClient />;
}
