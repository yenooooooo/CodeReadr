/**
 * 데모 모드 mock 데이터
 * 코드 프로젝트(Next.js 쇼핑몰)와 문서 프로젝트(웹개발 학습 가이드) 2종.
 * localStorage에 주입하여 API 호출 없이 전체 학습 흐름 체험 가능.
 */

import type { StoredProject, ProjectFile, ProjectStructure, TechStack } from '@/types/project';
import type { FileExplanation } from '@/utils/promptFileExplain';
import type { Quiz, ReviewChallenge, PromptScenario } from '@/types/quiz';
import { STORAGE_KEYS } from '@/constants';

/* ────────────────────────────────────────────
   코드 프로젝트 데모: "ShopEasy" Next.js 쇼핑몰
   ──────────────────────────────────────────── */

const CODE_FILES: ProjectFile[] = [
  {
    path: 'src/app/page.tsx',
    extension: 'tsx',
    size: 980,
    content: `'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ShopEasy</h1>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="상품 검색..."
        className="w-full p-3 border rounded-lg mb-8"
      />
      <div className="grid grid-cols-3 gap-6">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}`,
  },
  {
    path: 'src/app/layout.tsx',
    extension: 'tsx',
    size: 520,
    content: `import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShopEasy - 쉬운 쇼핑',
  description: 'Next.js 기반 온라인 쇼핑몰',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <CartProvider>
          <nav className="bg-white shadow p-4 flex justify-between">
            <span className="font-bold text-xl">ShopEasy</span>
            <CartDrawer />
          </nav>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}`,
  },
  {
    path: 'src/components/ProductCard.tsx',
    extension: 'tsx',
    size: 680,
    content: `'use client';

import { useCart } from '@/context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="border rounded-xl p-4 hover:shadow-lg transition-shadow">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg"
      />
      <h3 className="mt-3 font-semibold text-lg">{product.name}</h3>
      <p className="text-gray-500">{product.price.toLocaleString()}원</p>
      <button
        onClick={() => addItem(product)}
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        장바구니 담기
      </button>
    </div>
  );
}`,
  },
  {
    path: 'src/components/CartDrawer.tsx',
    extension: 'tsx',
    size: 750,
    content: `'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, totalPrice } = useCart();

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="relative">
        장바구니 ({items.length})
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-black/30 flex-1" onClick={() => setIsOpen(false)} />
          <aside className="w-80 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">장바구니</h2>
            {items.map(item => (
              <div key={item.id} className="flex justify-between py-2 border-b">
                <span>{item.name}</span>
                <div className="flex gap-2">
                  <span>{item.price.toLocaleString()}원</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-500">삭제</button>
                </div>
              </div>
            ))}
            <p className="mt-4 font-bold text-right">
              합계: {totalPrice.toLocaleString()}원
            </p>
          </aside>
        </div>
      )}
    </>
  );
}`,
  },
  {
    path: 'src/context/CartContext.tsx',
    extension: 'tsx',
    size: 820,
    content: `'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('CartProvider 밖에서 useCart를 사용할 수 없습니다.');
  return ctx;
}`,
  },
  {
    path: 'src/app/api/products/route.ts',
    extension: 'ts',
    size: 480,
    content: `import { NextResponse } from 'next/server';

const products = [
  { id: 1, name: '무선 블루투스 이어폰', price: 45000, image: '/earbuds.jpg' },
  { id: 2, name: '스마트 워치 Pro', price: 189000, image: '/watch.jpg' },
  { id: 3, name: 'USB-C 허브 7in1', price: 32000, image: '/hub.jpg' },
  { id: 4, name: '노트북 거치대', price: 28000, image: '/stand.jpg' },
  { id: 5, name: '기계식 키보드', price: 79000, image: '/keyboard.jpg' },
  { id: 6, name: '27인치 모니터', price: 320000, image: '/monitor.jpg' },
];

export async function GET() {
  return NextResponse.json(products);
}`,
  },
  {
    path: 'src/app/globals.css',
    extension: 'css',
    size: 220,
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Pretendard', sans-serif;
  background-color: #f8f9fa;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}`,
  },
  {
    path: 'package.json',
    extension: 'json',
    size: 350,
    content: `{
  "name": "shop-easy",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "tailwindcss": "3.4.0"
  },
  "devDependencies": {
    "@types/react": "18.3.0",
    "typescript": "5.4.0"
  }
}`,
  },
];

const CODE_STRUCTURE: ProjectStructure = {
  summary: 'Next.js 기반 온라인 쇼핑몰 — 상품 목록, 검색, 장바구니 기능을 갖춘 웹 애플리케이션',
  keyFeatures: ['상품 목록 조회', '실시간 검색', '장바구니 관리', '반응형 UI'],
  folderTree: [
    {
      name: 'src',
      type: 'folder',
      description: '소스코드',
      children: [
        { name: 'app', type: 'folder', description: '페이지/API' },
        { name: 'components', type: 'folder', description: 'UI 부품' },
        { name: 'context', type: 'folder', description: '상태관리' },
      ],
    },
  ],
  fileRoles: [
    { path: 'src/app/page.tsx', role: '메인 페이지', importance: 1 },
    { path: 'src/app/layout.tsx', role: '공통 레이아웃', importance: 1 },
    { path: 'src/components/ProductCard.tsx', role: '상품 카드', importance: 1 },
    { path: 'src/components/CartDrawer.tsx', role: '장바구니 서랍', importance: 1 },
    { path: 'src/context/CartContext.tsx', role: '장바구니 상태', importance: 1 },
    { path: 'src/app/api/products/route.ts', role: '상품 API', importance: 2 },
    { path: 'src/app/globals.css', role: '글로벌 스타일', importance: 3 },
    { path: 'package.json', role: '프로젝트 설정', importance: 3 },
  ],
};

const CODE_TECH_STACK: TechStack[] = [
  {
    name: 'Next.js',
    category: 'framework',
    analogyDescription: '웹사이트의 뼈대를 잡아주는 건축 설계도 같은 역할. 페이지 이동, 서버 통신 등을 자동으로 처리해줍니다.',
    projectUsage: '페이지 라우팅, API 엔드포인트, 서버사이드 렌더링에 사용',
    usedInFiles: ['src/app/page.tsx', 'src/app/layout.tsx', 'src/app/api/products/route.ts'],
    whyNeeded: '이게 없으면 페이지 이동, API 통신 등을 전부 직접 구현해야 합니다.',
  },
  {
    name: 'React',
    category: 'library',
    analogyDescription: '레고 블록처럼 화면을 작은 부품(컴포넌트)으로 나눠서 조립하는 도구입니다.',
    projectUsage: 'ProductCard, CartDrawer 등 UI 컴포넌트 구성',
    usedInFiles: ['src/components/ProductCard.tsx', 'src/components/CartDrawer.tsx'],
    whyNeeded: '이게 없으면 화면 변경 시마다 전체 페이지를 다시 그려야 해서 느려집니다.',
  },
  {
    name: 'TypeScript',
    category: 'language',
    analogyDescription: 'JavaScript에 "타입 검사기"를 붙인 것. 오타나 잘못된 데이터를 미리 잡아줍니다.',
    projectUsage: '모든 파일에서 타입 안전성 확보 (Product, CartItem 인터페이스 등)',
    usedInFiles: ['src/context/CartContext.tsx', 'src/app/page.tsx'],
    whyNeeded: '이게 없으면 런타임에서야 에러를 발견하게 되어 디버깅이 어려워집니다.',
  },
  {
    name: 'Tailwind CSS',
    category: 'library',
    analogyDescription: '미리 만들어진 디자인 스티커북. className에 이름만 적으면 바로 스타일이 적용됩니다.',
    projectUsage: '모든 컴포넌트의 레이아웃, 색상, 여백 등 스타일링',
    usedInFiles: ['src/app/globals.css', 'src/components/ProductCard.tsx'],
    whyNeeded: '이게 없으면 CSS 파일을 직접 작성해야 해서 개발 속도가 크게 느려집니다.',
  },
  {
    name: 'Context API',
    category: 'tool',
    analogyDescription: '가게 안에 설치된 공용 게시판 — 어디서든 장바구니 정보를 읽고 쓸 수 있습니다.',
    projectUsage: '장바구니 상태를 앱 전체에서 공유 (CartProvider → useCart)',
    usedInFiles: ['src/context/CartContext.tsx', 'src/components/ProductCard.tsx', 'src/components/CartDrawer.tsx'],
    whyNeeded: '이게 없으면 장바구니 데이터를 컴포넌트마다 일일이 전달해야 합니다.',
  },
];

const CODE_FILE_EXPLANATIONS: Record<string, FileExplanation> = {
  'src/app/page.tsx': {
    fileName: 'src/app/page.tsx',
    summary: '쇼핑몰 메인 페이지 — 상품 목록을 불러와서 보여주고, 검색 기능을 제공합니다.',
    blocks: [
      { startLine: 1, endLine: 3, title: '라이브러리 불러오기', explanation: 'React의 상태관리(useState)와 생명주기(useEffect) 도구, 그리고 상품 카드 컴포넌트를 가져옵니다.' },
      { startLine: 5, endLine: 10, title: '상품 데이터 타입 정의', explanation: '상품이 어떤 정보를 가지는지 미리 정해둡니다. id(고유번호), name(이름), price(가격), image(사진)가 필수입니다.' },
      { startLine: 12, endLine: 14, title: '상태 변수 선언', explanation: 'products는 상품 목록, search는 검색어를 저장하는 "기억 공간"입니다. 값이 바뀌면 화면이 자동으로 업데이트됩니다.' },
      { startLine: 16, endLine: 19, title: '상품 데이터 불러오기', explanation: '페이지가 처음 열릴 때 서버(API)에서 상품 목록을 가져옵니다. fetch는 "서버에 데이터 요청하기" 기능입니다.' },
      { startLine: 21, endLine: 23, title: '검색 필터링', explanation: '사용자가 입력한 검색어로 상품 이름을 걸러냅니다. toLowerCase()로 대소문자 구분 없이 검색합니다.' },
      { startLine: 25, endLine: 38, title: '화면 그리기 (렌더링)', explanation: '제목, 검색창, 상품 카드들을 배치합니다. grid로 3열 격자 형태로 상품을 보여주고, map으로 상품 하나하나에 카드를 만듭니다.' },
    ],
  },
  'src/app/layout.tsx': {
    fileName: 'src/app/layout.tsx',
    summary: '전체 앱의 공통 뼈대 — 네비게이션 바와 장바구니 기능을 모든 페이지에 제공합니다.',
    blocks: [
      { startLine: 1, endLine: 4, title: '필요한 모듈 불러오기', explanation: 'Next.js 메타데이터 타입, 장바구니 컨텍스트, 장바구니 서랍 컴포넌트, 글로벌 CSS를 가져옵니다.' },
      { startLine: 6, endLine: 9, title: '페이지 메타 정보', explanation: '브라우저 탭에 표시될 제목과 설명을 설정합니다. 검색엔진(구글)에도 이 정보가 표시됩니다.' },
      { startLine: 11, endLine: 23, title: '레이아웃 구조', explanation: 'CartProvider로 장바구니 기능을 앱 전체에 제공하고, 상단에 네비게이션 바를 배치합니다. {children}은 각 페이지의 내용이 들어가는 자리입니다.' },
    ],
  },
  'src/components/ProductCard.tsx': {
    fileName: 'src/components/ProductCard.tsx',
    summary: '개별 상품을 카드 형태로 보여주는 UI 부품 — 이미지, 이름, 가격, 담기 버튼을 포함합니다.',
    blocks: [
      { startLine: 1, endLine: 3, title: '장바구니 기능 연결', explanation: 'useCart 훅을 가져와서 이 카드에서 바로 장바구니에 상품을 담을 수 있게 합니다.' },
      { startLine: 5, endLine: 10, title: '상품 타입 정의', explanation: '이 컴포넌트가 받아야 하는 상품 정보의 구조를 정의합니다.' },
      { startLine: 12, endLine: 30, title: '카드 UI 렌더링', explanation: '상품 이미지, 이름, 가격을 카드 형태로 배치하고, "장바구니 담기" 버튼을 클릭하면 addItem 함수가 실행되어 장바구니에 추가됩니다.' },
    ],
  },
  'src/components/CartDrawer.tsx': {
    fileName: 'src/components/CartDrawer.tsx',
    summary: '장바구니 서랍 — 버튼을 누르면 오른쪽에서 슬라이드되며 담긴 상품 목록과 합계를 보여줍니다.',
    blocks: [
      { startLine: 1, endLine: 5, title: '상태와 장바구니 연결', explanation: '서랍 열림/닫힘 상태(isOpen)와 장바구니 데이터(items, removeItem, totalPrice)를 가져옵니다.' },
      { startLine: 7, endLine: 10, title: '장바구니 버튼', explanation: '현재 담긴 상품 개수를 표시하는 버튼입니다. 클릭하면 서랍이 열립니다.' },
      { startLine: 12, endLine: 30, title: '서랍 UI', explanation: '반투명 배경(클릭하면 닫힘)과 오른쪽 흰색 패널로 구성됩니다. 각 상품의 이름, 가격, 삭제 버튼이 표시되고 하단에 합계금액이 나옵니다.' },
    ],
  },
  'src/context/CartContext.tsx': {
    fileName: 'src/context/CartContext.tsx',
    summary: '장바구니 상태관리 중앙 저장소 — 앱 어디서든 장바구니에 접근할 수 있게 하는 "공용 게시판"입니다.',
    blocks: [
      { startLine: 1, endLine: 3, title: 'React 도구 불러오기', explanation: 'createContext(공유 공간 만들기), useContext(공유 공간 접근), useState(상태 저장)를 가져옵니다.' },
      { startLine: 5, endLine: 14, title: '데이터 타입 정의', explanation: 'CartItem은 장바구니에 담긴 상품 하나의 구조, CartContextType은 장바구니가 제공하는 기능 목록(담기, 빼기, 합계)입니다.' },
      { startLine: 16, endLine: 28, title: 'CartProvider 컴포넌트', explanation: '장바구니 데이터를 실제로 관리하는 컴포넌트입니다. addItem은 상품 추가, removeItem은 상품 제거, totalPrice는 합계를 계산합니다.' },
      { startLine: 30, endLine: 35, title: 'useCart 훅', explanation: '다른 컴포넌트에서 장바구니를 쉽게 사용할 수 있게 해주는 "바로가기"입니다. CartProvider 바깥에서 쓰면 에러가 발생합니다.' },
    ],
  },
  'src/app/api/products/route.ts': {
    fileName: 'src/app/api/products/route.ts',
    summary: '상품 데이터를 제공하는 API — 프론트엔드가 상품 목록을 요청하면 JSON으로 응답합니다.',
    blocks: [
      { startLine: 1, endLine: 1, title: 'Next.js 응답 도구', explanation: 'NextResponse는 서버에서 클라이언트(브라우저)로 데이터를 보낼 때 사용하는 도구입니다.' },
      { startLine: 3, endLine: 10, title: '상품 데이터', explanation: '판매할 상품 6개가 배열로 저장되어 있습니다. 실제 서비스에서는 이 데이터가 데이터베이스에서 옵니다.' },
      { startLine: 12, endLine: 14, title: 'GET 요청 처리', explanation: '/api/products로 요청이 오면 상품 목록을 JSON 형식으로 반환합니다. GET은 "데이터를 달라"는 요청 방식입니다.' },
    ],
  },
  'src/app/globals.css': {
    fileName: 'src/app/globals.css',
    summary: '전체 앱에 적용되는 기본 스타일 — Tailwind CSS 설정과 기본 폰트, 배경색을 정의합니다.',
    blocks: [
      { startLine: 1, endLine: 3, title: 'Tailwind 초기화', explanation: 'Tailwind CSS의 기본(base), 컴포넌트(components), 유틸리티(utilities) 스타일을 불러옵니다.' },
      { startLine: 5, endLine: 8, title: '기본 스타일', explanation: '전체 페이지의 기본 폰트(Pretendard)와 배경색(연한 회색)을 설정합니다.' },
    ],
  },
  'package.json': {
    fileName: 'package.json',
    summary: '프로젝트 설정 파일 — 프로젝트 이름, 실행 명령어, 필요한 라이브러리 목록이 담겨 있습니다.',
    blocks: [
      { startLine: 1, endLine: 4, title: '프로젝트 기본 정보', explanation: '프로젝트 이름(shop-easy)과 버전(1.0.0)을 정의합니다.' },
      { startLine: 5, endLine: 9, title: '실행 명령어', explanation: 'dev는 개발 서버, build는 배포용 빌드, start는 서비스 시작 명령어입니다.' },
      { startLine: 10, endLine: 15, title: '필수 라이브러리', explanation: 'Next.js, React, Tailwind 등 앱 실행에 반드시 필요한 라이브러리와 버전 목록입니다.' },
    ],
  },
};

const CODE_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    type: 'explanation',
    codeBlock: `const filtered = products.filter(p =>
  p.name.toLowerCase().includes(search.toLowerCase())
);`,
    filePath: 'src/app/page.tsx',
    question: '이 코드는 어떤 기능을 하나요? 왜 toLowerCase()를 사용할까요?',
    correctAnswer: '검색어로 상품 이름을 필터링합니다. toLowerCase()는 대소문자 구분 없이 검색하기 위해 사용합니다.',
    explanation: 'filter는 조건에 맞는 항목만 골라내는 메서드이고, includes는 텍스트 포함 여부를 확인합니다.',
  },
  {
    id: 'quiz-2',
    type: 'multiple_choice',
    codeBlock: `<CartProvider>
  <nav>...</nav>
  {children}
</CartProvider>`,
    filePath: 'src/app/layout.tsx',
    question: 'CartProvider가 layout.tsx에 있는 이유는 무엇일까요?',
    choices: [
      '장바구니 UI를 예쁘게 보여주기 위해',
      '앱 전체에서 장바구니 데이터를 공유하기 위해',
      '페이지 로딩 속도를 빠르게 하기 위해',
      '서버에서 장바구니 데이터를 불러오기 위해',
    ],
    correctAnswer: '앱 전체에서 장바구니 데이터를 공유하기 위해',
    explanation: 'Provider가 최상위 레이아웃에 있으면 하위 모든 컴포넌트에서 useCart()로 접근할 수 있습니다.',
  },
  {
    id: 'quiz-3',
    type: 'short_answer',
    codeBlock: `const addItem = (item: CartItem) => {
  setItems(prev => [...prev, item]);
};`,
    filePath: 'src/context/CartContext.tsx',
    question: '...prev는 무엇이고, [...prev, item]은 어떤 의미인가요?',
    correctAnswer: 'prev는 이전 장바구니 목록이고, [...prev, item]은 기존 목록에 새 상품을 추가한 새 배열을 만듭니다.',
    explanation: '스프레드 연산자(...)는 배열을 펼치는 문법입니다. 기존 배열을 복사한 후 새 항목을 끝에 추가합니다.',
  },
];

const CODE_CHALLENGES: ReviewChallenge[] = [
  {
    id: 'review-1',
    category: 'performance',
    codeBlock: `useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);`,
    filePath: 'src/app/page.tsx',
    hints: [
      '데이터를 가져오는 부분을 살펴보세요.',
      'fetch가 실패하면 어떤 일이 벌어질까요?',
      '에러 처리(try-catch 또는 .catch)가 없습니다.',
    ],
    issue: 'API 호출 실패 시 에러 처리가 없어서 사용자에게 아무 피드백도 없습니다.',
    improvedCode: `useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => setProducts(data))
    .catch(() => setError('상품을 불러올 수 없습니다.'));
}, []);`,
    improvementReason: '.catch를 추가하면 네트워크 오류 시 사용자에게 안내 메시지를 보여줄 수 있습니다.',
  },
  {
    id: 'review-2',
    category: 'security',
    codeBlock: `<img
  src={product.image}
  alt={product.name}
  className="w-full h-48 object-cover"
/>`,
    filePath: 'src/components/ProductCard.tsx',
    hints: [
      '이미지 소스가 어디서 오는지 생각해보세요.',
      '외부에서 전달된 URL이 안전한지 검증하나요?',
      'Next.js의 Image 컴포넌트를 사용하면 자동으로 최적화와 보안 처리가 됩니다.',
    ],
    issue: '일반 <img> 태그는 이미지 최적화나 외부 URL 보안 검증이 없습니다.',
    improvedCode: `import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={400} height={192}
  className="w-full h-48 object-cover"
/>`,
    improvementReason: 'Next.js Image 컴포넌트는 자동 최적화, 지연 로딩, 외부 이미지 도메인 검증을 제공합니다.',
  },
  {
    id: 'review-3',
    category: 'structure',
    codeBlock: `const addItem = (item: CartItem) => {
  setItems(prev => [...prev, item]);
};`,
    filePath: 'src/context/CartContext.tsx',
    hints: [
      '같은 상품을 두 번 담으면 어떻게 될까요?',
      '장바구니에 중복된 항목이 각각 따로 추가됩니다.',
      '수량(quantity) 필드를 추가하고 같은 상품이면 수량만 증가시키는 로직이 필요합니다.',
    ],
    issue: '같은 상품을 여러 번 담으면 중복 항목이 생깁니다. 수량 관리 기능이 없습니다.',
    improvedCode: `const addItem = (item: CartItem) => {
  setItems(prev => {
    const existing = prev.find(i => i.id === item.id);
    if (existing) return prev.map(i =>
      i.id === item.id ? { ...i, qty: i.qty + 1 } : i
    );
    return [...prev, { ...item, qty: 1 }];
  });
};`,
    improvementReason: '중복 체크 후 수량을 증가시키면 장바구니 UI가 깔끔해지고 사용자 경험이 개선됩니다.',
  },
];

const CODE_SCENARIOS: PromptScenario[] = [
  {
    id: 'scenario-1',
    title: '상품 상세 페이지 추가',
    description: '상품 카드를 클릭하면 상세 페이지(/product/[id])로 이동하여 큰 이미지, 상세 설명, 리뷰를 볼 수 있는 기능을 추가하세요.',
    relatedFiles: ['src/app/page.tsx', 'src/components/ProductCard.tsx', 'src/app/api/products/route.ts'],
  },
  {
    id: 'scenario-2',
    title: '주문/결제 기능',
    description: '장바구니에서 "결제하기" 버튼을 누르면 배송지 입력, 결제 수단 선택, 주문 확인 화면이 나오는 결제 플로우를 추가하세요.',
    relatedFiles: ['src/components/CartDrawer.tsx', 'src/context/CartContext.tsx'],
  },
  {
    id: 'scenario-3',
    title: '사용자 로그인 & 위시리스트',
    description: '이메일/비밀번호로 로그인하고, 로그인한 사용자가 상품에 하트를 눌러 위시리스트에 저장할 수 있는 기능을 추가하세요.',
    relatedFiles: ['src/app/layout.tsx', 'src/components/ProductCard.tsx', 'src/context/CartContext.tsx'],
  },
];


/* ────────────────────────────────────────────
   문서 프로젝트 데모: "웹개발 학습 가이드" MD
   ──────────────────────────────────────────── */

const DOC_FILES: ProjectFile[] = [
  {
    path: 'STUDY-GUIDE.md',
    extension: 'md',
    size: 3200,
    content: `# React/Next.js 웹개발 학습 가이드

## 1. 프로젝트 개요
이 문서는 React와 Next.js를 사용한 웹 애플리케이션 개발의 핵심 개념을 정리한 학습 가이드입니다.
프론트엔드 개발의 기초부터 배포까지 전체 흐름을 다룹니다.

## 2. 기술 스택 구성
- **React 18**: UI를 컴포넌트 단위로 구성하는 라이브러리
- **Next.js 14**: React 기반 풀스택 프레임워크 (라우팅, SSR, API)
- **TypeScript**: 정적 타입 검사로 안전한 코드 작성
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Vercel**: Next.js 최적화 배포 플랫폼

## 3. 컴포넌트 구조와 데이터 흐름
React에서는 화면을 작은 단위(컴포넌트)로 나눕니다.
각 컴포넌트는 자신만의 상태(state)를 가질 수 있고,
부모에서 자식으로 데이터(props)를 전달합니다.

### 컴포넌트 계층 예시
\`\`\`
App (최상위)
├── Header (네비게이션)
├── ProductList (상품 목록)
│   └── ProductCard (개별 상품)
└── Footer (하단 정보)
\`\`\`

### 상태관리 패턴
- **useState**: 컴포넌트 내부 상태 (검색어, 토글 등)
- **useContext**: 전역 상태 공유 (로그인 정보, 테마 등)
- **useEffect**: 외부 데이터 가져오기, 구독 설정 등 부수 효과

## 4. API 통신 흐름
클라이언트와 서버 간 데이터 교환 방식:

1. **클라이언트 → 서버**: fetch() 또는 axios로 HTTP 요청
2. **서버 처리**: API Route에서 데이터베이스 조회/가공
3. **서버 → 클라이언트**: JSON 응답 반환
4. **화면 갱신**: 받은 데이터로 state 업데이트 → 자동 리렌더

### Next.js API Route 구조
\`\`\`
src/app/api/
├── products/route.ts    (GET: 상품 목록)
├── cart/route.ts        (POST: 장바구니 추가)
└── auth/login/route.ts  (POST: 로그인)
\`\`\`

## 5. 스타일링 전략
Tailwind CSS를 메인으로 사용하며, 필요 시 CSS Modules를 병행합니다.

### Tailwind 핵심 클래스
- 레이아웃: flex, grid, gap-4, mx-auto
- 반응형: sm:, md:, lg: 접두사로 화면 크기별 스타일
- 상태: hover:, focus:, active: 접두사로 인터랙션 스타일

## 6. 배포 & CI/CD
1. GitHub에 코드 푸시
2. Vercel이 자동 빌드 (next build)
3. 빌드 성공 시 자동 배포
4. 프리뷰 URL로 테스트 → 메인 브랜치 머지 시 프로덕션 배포

### 환경변수 관리
- .env.local: 로컬 개발용 (Git 제외)
- Vercel Dashboard: 프로덕션 환경변수 설정
- NEXT_PUBLIC_ 접두사: 클라이언트에서 접근 가능한 변수

## 7. 학습 로드맵
1단계: HTML/CSS/JS 기초 → 2단계: React 핵심 (JSX, 컴포넌트, 훅)
→ 3단계: Next.js (라우팅, SSR, API) → 4단계: TypeScript 적용
→ 5단계: 상태관리 심화 → 6단계: 테스트 & 배포
`,
  },
];

const DOC_STRUCTURE: ProjectStructure = {
  summary: 'React/Next.js 웹개발의 핵심 개념과 코드 흐름을 정리한 학습 가이드 문서',
  keyFeatures: ['기술 스택 정리', '컴포넌트 구조 설명', 'API 통신 흐름', '배포 프로세스'],
  folderTree: [
    { name: 'STUDY-GUIDE.md', type: 'file', description: '학습 가이드' },
  ],
  fileRoles: [
    { path: 'STUDY-GUIDE.md', role: '웹개발 학습 가이드', importance: 1 },
  ],
};

const DOC_TECH_STACK: TechStack[] = [
  {
    name: 'React',
    category: 'library',
    analogyDescription: '레고 블록처럼 화면을 작은 부품(컴포넌트)으로 나눠서 조립하는 도구입니다.',
    projectUsage: '문서에서 UI 컴포넌트 구조와 상태관리 패턴을 설명하는 핵심 기술',
    usedInFiles: ['STUDY-GUIDE.md'],
    whyNeeded: '이게 없으면 화면을 효율적으로 나누고 관리할 수 없습니다.',
  },
  {
    name: 'Next.js',
    category: 'framework',
    analogyDescription: '웹사이트의 뼈대를 잡아주는 건축 설계도. 페이지 이동, 서버 통신, 배포까지 한 번에 해결합니다.',
    projectUsage: '문서에서 라우팅, API Route, SSR, 배포 흐름을 설명하는 메인 프레임워크',
    usedInFiles: ['STUDY-GUIDE.md'],
    whyNeeded: '이게 없으면 라우팅, 서버 렌더링, API 등을 직접 구현해야 합니다.',
  },
  {
    name: 'TypeScript',
    category: 'language',
    analogyDescription: 'JavaScript에 "맞춤법 검사기"를 붙인 것. 코드를 작성할 때 실수를 미리 잡아줍니다.',
    projectUsage: '문서에서 안전한 코드 작성을 위한 정적 타입 시스템으로 소개',
    usedInFiles: ['STUDY-GUIDE.md'],
    whyNeeded: '이게 없으면 런타임에서야 오류를 발견하게 됩니다.',
  },
  {
    name: 'Tailwind CSS',
    category: 'library',
    analogyDescription: '미리 만들어진 디자인 스티커북. 클래스명만 적으면 스타일이 바로 적용됩니다.',
    projectUsage: '문서에서 스타일링 전략과 핵심 클래스 사용법을 설명',
    usedInFiles: ['STUDY-GUIDE.md'],
    whyNeeded: '이게 없으면 CSS를 직접 작성해야 해서 개발이 느려집니다.',
  },
];

const DOC_FILE_EXPLANATIONS: Record<string, FileExplanation> = {
  'STUDY-GUIDE.md': {
    fileName: 'STUDY-GUIDE.md',
    summary: 'React/Next.js 웹개발의 전체 흐름을 기초부터 배포까지 정리한 종합 학습 가이드입니다.',
    blocks: [
      { startLine: 1, endLine: 5, title: '프로젝트 개요', explanation: '이 문서의 목적을 소개합니다. React와 Next.js를 사용한 웹개발 전체 흐름을 학습하는 것이 목표입니다.' },
      { startLine: 7, endLine: 13, title: '기술 스택 구성', explanation: '프로젝트에 사용되는 5가지 핵심 기술을 나열합니다. 각 기술이 어떤 역할을 하는지 한 줄로 요약되어 있습니다.' },
      { startLine: 15, endLine: 30, title: '컴포넌트 구조와 데이터 흐름', explanation: 'React의 핵심 개념인 컴포넌트, 상태(state), 속성(props)을 설명합니다. 화면을 작은 단위로 나누고 데이터를 전달하는 방식을 다룹니다.' },
      { startLine: 31, endLine: 36, title: '상태관리 패턴', explanation: 'useState, useContext, useEffect 세 가지 React Hook의 용도를 정리합니다. 각각 언제 사용하는지 예시와 함께 설명합니다.' },
      { startLine: 38, endLine: 51, title: 'API 통신 흐름', explanation: '브라우저(클라이언트)와 서버가 데이터를 주고받는 4단계 흐름을 설명합니다. Next.js의 API Route 디렉토리 구조도 함께 보여줍니다.' },
      { startLine: 53, endLine: 60, title: '스타일링 전략', explanation: 'Tailwind CSS의 핵심 클래스들을 카테고리별로 정리합니다. 레이아웃, 반응형, 인터랙션 스타일을 접두사 방식으로 적용합니다.' },
      { startLine: 62, endLine: 72, title: '배포 & CI/CD', explanation: 'GitHub에 코드를 올리면 Vercel이 자동으로 빌드하고 배포하는 과정을 설명합니다. 환경변수 관리 방법도 포함되어 있습니다.' },
      { startLine: 74, endLine: 77, title: '학습 로드맵', explanation: 'HTML/CSS 기초부터 테스트/배포까지 6단계 학습 순서를 제시합니다. 각 단계를 순서대로 따라가면 체계적으로 학습할 수 있습니다.' },
    ],
  },
};

const DOC_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    type: 'explanation',
    codeBlock: `App (최상위)
├── Header (네비게이션)
├── ProductList (상품 목록)
│   └── ProductCard (개별 상품)
└── Footer (하단 정보)`,
    filePath: 'STUDY-GUIDE.md',
    question: '이 컴포넌트 계층 구조에서 ProductCard는 왜 ProductList 안에 있나요?',
    correctAnswer: 'ProductCard는 개별 상품을 표시하는 컴포넌트이고, ProductList가 여러 개의 ProductCard를 반복해서 보여주기 때문입니다.',
    explanation: 'React에서는 부모 컴포넌트가 자식 컴포넌트를 포함하는 트리 구조로 UI를 구성합니다.',
  },
  {
    id: 'quiz-2',
    type: 'multiple_choice',
    codeBlock: `- useState: 컴포넌트 내부 상태
- useContext: 전역 상태 공유
- useEffect: 외부 데이터 가져오기`,
    filePath: 'STUDY-GUIDE.md',
    question: '로그인 정보를 앱 전체에서 공유하려면 어떤 Hook을 사용해야 할까요?',
    choices: [
      'useState — 컴포넌트 내부 상태',
      'useContext — 전역 상태 공유',
      'useEffect — 부수 효과 처리',
      'useRef — DOM 직접 접근',
    ],
    correctAnswer: 'useContext — 전역 상태 공유',
    explanation: '로그인 정보는 여러 컴포넌트에서 필요하므로 useContext로 전역에 공유하는 것이 적합합니다.',
  },
  {
    id: 'quiz-3',
    type: 'short_answer',
    codeBlock: `1. 클라이언트 → 서버: fetch() 요청
2. 서버 처리: API Route에서 DB 조회
3. 서버 → 클라이언트: JSON 응답
4. 화면 갱신: state 업데이트 → 리렌더`,
    filePath: 'STUDY-GUIDE.md',
    question: '4단계 중 "화면 갱신"이 자동으로 일어나는 이유는 무엇인가요?',
    correctAnswer: 'React에서 state가 변경되면 해당 컴포넌트가 자동으로 다시 렌더링되기 때문입니다.',
    explanation: 'useState로 관리하는 state가 바뀌면 React가 변경된 부분만 찾아서 화면을 업데이트합니다.',
  },
];

const DOC_CHALLENGES: ReviewChallenge[] = [
  {
    id: 'review-1',
    category: 'structure',
    codeBlock: `## 3. 컴포넌트 구조와 데이터 흐름
React에서는 화면을 작은 단위로 나눕니다.
각 컴포넌트는 자신만의 상태(state)를 가질 수 있고,
부모에서 자식으로 데이터(props)를 전달합니다.`,
    filePath: 'STUDY-GUIDE.md',
    hints: [
      '데이터가 항상 부모→자식으로만 흐를까요?',
      '자식 컴포넌트에서 부모의 상태를 변경해야 할 때는 어떻게 할까요?',
      'props로 콜백 함수를 전달하거나 상태 끌어올리기(lifting state up) 패턴이 빠져 있습니다.',
    ],
    issue: '데이터가 부모→자식으로만 흐른다고 설명하지만, 역방향 통신(자식→부모) 패턴이 누락되어 있습니다.',
    improvedCode: `## 3. 컴포넌트 구조와 데이터 흐름
- 부모→자식: props로 데이터 전달
- 자식→부모: 콜백 함수를 props로 전달
- 형제 간: 공통 부모로 상태 끌어올리기
- 전역: Context API 또는 상태관리 라이브러리`,
    improvementReason: '양방향 데이터 흐름을 설명해야 실제 앱 개발에서 컴포넌트 간 통신을 올바르게 설계할 수 있습니다.',
  },
  {
    id: 'review-2',
    category: 'error_handling',
    codeBlock: `1. 클라이언트 → 서버: fetch() 요청
2. 서버 처리: API Route에서 DB 조회
3. 서버 → 클라이언트: JSON 응답
4. 화면 갱신: state 업데이트 → 리렌더`,
    filePath: 'STUDY-GUIDE.md',
    hints: [
      '이 흐름에서 문제가 생기면 어떻게 될까요?',
      '네트워크 오류나 서버 에러(500) 시 처리 방법이 없습니다.',
      'try-catch, 로딩 상태, 에러 상태 처리가 필요합니다.',
    ],
    issue: 'API 통신 흐름에서 에러 핸들링과 로딩 상태 관리가 빠져 있습니다.',
    improvedCode: `1. 로딩 표시 (isLoading = true)
2. 클라이언트 → 서버: fetch() 요청
3. 성공 시: JSON 파싱 → state 업데이트
4. 실패 시: 에러 메시지 표시 (try-catch)
5. 완료: 로딩 해제 (isLoading = false)`,
    improvementReason: '실제 서비스에서는 네트워크 오류가 흔하므로 로딩/에러 상태 관리는 필수 패턴입니다.',
  },
  {
    id: 'review-3',
    category: 'security',
    codeBlock: `### 환경변수 관리
- .env.local: 로컬 개발용 (Git 제외)
- Vercel Dashboard: 프로덕션 환경변수
- NEXT_PUBLIC_ 접두사: 클라이언트 접근 가능`,
    filePath: 'STUDY-GUIDE.md',
    hints: [
      'NEXT_PUBLIC_ 접두사가 붙은 변수는 누구나 볼 수 있습니다.',
      '브라우저 소스 코드에서 해당 값이 노출됩니다.',
      'API 키 같은 민감한 정보는 절대 NEXT_PUBLIC_을 붙이면 안 됩니다.',
    ],
    issue: 'NEXT_PUBLIC_ 접두사의 보안 위험성에 대한 경고가 없습니다.',
    improvedCode: `### 환경변수 관리
- .env.local: 로컬 개발용 (Git 제외)
- NEXT_PUBLIC_: 클라이언트 노출됨 (공개 가능한 값만!)
- 서버 전용: API 키, DB 비밀번호 등 민감 정보
- ⚠️ 주의: NEXT_PUBLIC_ 변수는 빌드 시 코드에 삽입되어 누구나 볼 수 있음`,
    improvementReason: 'NEXT_PUBLIC_ 변수가 브라우저에 노출된다는 사실을 모르면 API 키를 실수로 공개할 수 있습니다.',
  },
];

const DOC_SCENARIOS: PromptScenario[] = [
  {
    id: 'scenario-1',
    title: '인증/로그인 섹션 추가',
    description: '학습 가이드에 사용자 인증(로그인/회원가입) 구현 방법 섹션을 추가하세요. JWT 토큰, 세션 관리, 보호된 라우트 패턴을 포함해야 합니다.',
    relatedFiles: ['STUDY-GUIDE.md'],
  },
  {
    id: 'scenario-2',
    title: '데이터베이스 연동 섹션 추가',
    description: 'Prisma ORM을 사용한 데이터베이스 연동 방법 섹션을 추가하세요. 스키마 정의, CRUD 작업, 마이그레이션 과정을 포함해야 합니다.',
    relatedFiles: ['STUDY-GUIDE.md'],
  },
  {
    id: 'scenario-3',
    title: '테스트 전략 섹션 추가',
    description: 'React 컴포넌트 테스트 방법 섹션을 추가하세요. Jest + React Testing Library를 사용한 단위 테스트와 E2E 테스트 전략을 포함해야 합니다.',
    relatedFiles: ['STUDY-GUIDE.md'],
  },
];


/* ────────────────────────────────────────────
   데모 로더: localStorage에 mock 데이터 주입
   ──────────────────────────────────────────── */

export type DemoType = 'code' | 'doc';

/** 기존 데모/프로젝트 데이터 초기화 */
function clearProjectData() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('codereadr_')) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

/** 데모 데이터를 localStorage에 주입 */
export function loadDemoData(type: DemoType): void {
  clearProjectData();

  const isCode = type === 'code';
  const files = isCode ? CODE_FILES : DOC_FILES;
  const fileCount = files.length;

  // StoredProject
  const project: StoredProject = {
    name: isCode ? 'ShopEasy — Next.js 쇼핑몰 (데모)' : '웹개발 학습 가이드 (데모)',
    files,
    analyzedAt: new Date().toISOString(),
    structure: isCode ? CODE_STRUCTURE : DOC_STRUCTURE,
    techStack: isCode ? CODE_TECH_STACK : DOC_TECH_STACK,
  };
  localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));

  // Step 3: 파일별 설명 캐시
  const explanations = isCode ? CODE_FILE_EXPLANATIONS : DOC_FILE_EXPLANATIONS;
  for (const [path, explanation] of Object.entries(explanations)) {
    localStorage.setItem(`codereadr_file_${path}`, JSON.stringify(explanation));
  }

  // Step 4: 퀴즈
  const quizzes = isCode ? CODE_QUIZZES : DOC_QUIZZES;
  localStorage.setItem(`codereadr_step4_${fileCount}`, JSON.stringify({ quizzes }));

  // Step 5: 리뷰 챌린지
  const challenges = isCode ? CODE_CHALLENGES : DOC_CHALLENGES;
  localStorage.setItem(`codereadr_step5_${fileCount}`, JSON.stringify({ challenges }));

  // Step 6: 프롬프트 시나리오
  const scenarios = isCode ? CODE_SCENARIOS : DOC_SCENARIOS;
  localStorage.setItem('codereadr_step6', JSON.stringify({ scenarios }));
}
