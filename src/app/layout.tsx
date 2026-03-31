/**
 * 루트 레이아웃
 * Logical Architect 디자인 시스템 적용.
 * 다크 모드 전용, Inter + JetBrains Mono 폰트,
 * Header + Sidebar + Main + Footer 4영역 구조.
 */

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

/** UI 요소용 폰트 (네비게이션, 라벨, 시스템 메시지) */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

/** 코드/데이터용 모노스페이스 폰트 */
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

/** 페이지 메타데이터 */
export const metadata: Metadata = {
  title: '코드읽기 — 바이브코더에서 진짜 개발자로',
  description:
    'AI가 내 프로젝트 코드를 기반으로 단계별로 가르쳐주는 학습 앱',
};

/**
 * 루트 레이아웃 컴포넌트.
 * Header(상단) + Sidebar(좌측) + Main(중앙) + Footer(하단) 구조.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      <body className="h-screen flex flex-col overflow-hidden">
        {/* 상단 헤더 바 (고정) */}
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {/* 좌측 사이드바 */}
          <Sidebar />
          {/* 메인 콘텐츠 영역 */}
          <main className="flex-1 overflow-y-auto bg-surface">
            {children}
          </main>
        </div>
        {/* 하단 상태 바 (고정) */}
        <Footer />
      </body>
    </html>
  );
}
