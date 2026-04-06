/**
 * 앱 전역 상수 정의
 * 하드코딩 방지를 위해 모든 상수를 여기서 관리한다.
 */

import type { LearningStepInfo } from '@/types/learning';

/** 파일 업로드 최대 용량 (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** 지원하는 코드 파일 확장자 목록 */
export const SUPPORTED_EXTENSIONS = [
  'ts', 'tsx', 'js', 'jsx', 'css', 'json',
  'html', 'md', 'yaml', 'yml', 'env',
] as const;

/** 업로드 시 지원하는 파일 MIME 타입 */
export const SUPPORTED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/markdown',
  'application/json',
] as const;

/** localStorage 키 이름 */
export const STORAGE_KEYS = {
  PROJECT: 'codereadr_project',
  PROGRESS: 'codereadr_progress',
  HISTORY: 'codereadr_history',
} as const;

/** Gemini API 설정 */
export const GEMINI_CONFIG = {
  /** 코드 분석용 낮은 temperature */
  ANALYSIS_TEMPERATURE: 0.3,
  /** 콘텐츠 생성용 중간 temperature */
  CONTENT_TEMPERATURE: 0.5,
  /** 최대 출력 토큰 수 */
  MAX_OUTPUT_TOKENS: 8192,
  /** 기본 모델 */
  DEFAULT_MODEL: 'gemini-2.5-flash',
  /** 폴백 모델 목록 (기본 모델 429 시 순차 시도) */
  FALLBACK_MODELS: ['gemini-2.0-flash', 'gemini-2.5-flash-lite-preview-06-17'] as string[],
} as const;

/** 6단계 학습 시스템 정보 */
export const LEARNING_STEPS: LearningStepInfo[] = [
  {
    step: 1,
    title: '프로젝트 스캔',
    description: '프로젝트 전체 구조를 파악합니다',
    icon: '🗺️',
    difficulty: '입문',
  },
  {
    step: 2,
    title: '기술 스택 학습',
    description: '사용된 기술들을 하나씩 배웁니다',
    icon: '🧱',
    difficulty: '기초',
  },
  {
    step: 3,
    title: '코드 따라읽기',
    description: '유저 행동별 코드 흐름을 추적합니다',
    icon: '🔍',
    difficulty: '중급',
  },
  {
    step: 4,
    title: '퀴즈 & 설명 연습',
    description: '코드를 자기 말로 설명해봅니다',
    icon: '📝',
    difficulty: '심화',
  },
  {
    step: 5,
    title: '코드 리뷰 훈련',
    description: '코드의 문제점을 찾는 연습을 합니다',
    icon: '🔎',
    difficulty: '최종',
  },
  {
    step: 6,
    title: '프롬프트 마스터',
    description: 'AI에게 구체적으로 지시하는 법을 배웁니다',
    icon: '🚀',
    difficulty: '실전',
  },
];

/** UI 텍스트 (한국어) */
export const UI_TEXT = {
  APP_NAME: '코드읽기',
  APP_SUBTITLE: '바이브코더에서 진짜 개발자로',
  UPLOAD_TITLE: '프로젝트 파일을 업로드하세요',
  UPLOAD_DESCRIPTION: '코드 파일을 드래그하거나 클릭하여 선택하세요',
  UPLOAD_FORMATS: '.zip, .md, .ts, .tsx, .js, .jsx, .css, .json',
  GITHUB_COMING_SOON: 'GitHub URL 분석은 준비 중입니다',
  START_LEARNING: '학습 시작',
  LOADING_ANALYSIS: 'AI가 코드를 분석하고 있어요...',
  ERROR_GENERIC: '문제가 발생했어요. 다시 시도해주세요.',
  ERROR_FILE_TOO_LARGE: '파일 크기가 10MB를 초과했어요.',
  ERROR_UNSUPPORTED_FILE: '지원하지 않는 파일 형식이에요.',
  ERROR_API_FAILED: 'AI 분석에 실패했어요. API 할당량이 소진됐을 수 있어요. 잠시 후 다시 시도해주세요.',
} as const;
