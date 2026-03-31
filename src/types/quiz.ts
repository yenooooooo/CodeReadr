/**
 * 퀴즈 및 코드 리뷰 관련 타입 정의
 * 4단계(퀴즈), 5단계(코드 리뷰), 6단계(프롬프트 훈련)에서 사용한다.
 */

/** 퀴즈 문제 유형 */
export type QuizType = 'explanation' | 'multiple_choice' | 'short_answer';

/** 퀴즈 문제 */
export interface Quiz {
  /** 문제 ID */
  id: string;
  /** 문제 유형 */
  type: QuizType;
  /** 관련 코드 블록 */
  codeBlock: string;
  /** 관련 파일 경로 */
  filePath: string;
  /** 질문 내용 */
  question: string;
  /** 객관식인 경우 선택지 */
  choices?: string[];
  /** 정답 (채점용) */
  correctAnswer: string;
  /** 해설 */
  explanation: string;
}

/** 유저의 퀴즈 답변 */
export interface QuizAnswer {
  /** 문제 ID */
  quizId: string;
  /** 유저 답변 */
  userAnswer: string;
  /** AI 평가 결과 */
  evaluation: QuizEvaluation;
}

/** AI의 퀴즈 평가 결과 */
export interface QuizEvaluation {
  /** 점수 (0~100) */
  score: number;
  /** 잘한 점 */
  strengths: string;
  /** 부족한 점 */
  weaknesses: string;
  /** 모범 답변 */
  modelAnswer: string;
}

/** 코드 리뷰 챌린지 (5단계) */
export interface ReviewChallenge {
  /** 챌린지 ID */
  id: string;
  /** 리뷰 카테고리 */
  category: ReviewCategory;
  /** 문제가 있는 코드 블록 */
  codeBlock: string;
  /** 파일 경로 */
  filePath: string;
  /** 힌트 (3단계) */
  hints: [string, string, string];
  /** 문제점 설명 */
  issue: string;
  /** 개선된 코드 */
  improvedCode: string;
  /** 개선 이유 설명 */
  improvementReason: string;
}

/** 코드 리뷰 카테고리 */
export type ReviewCategory =
  | 'security'      // 보안 취약점
  | 'performance'   // 성능 이슈
  | 'structure'     // 코드 구조
  | 'error_handling' // 에러 처리
  | 'accessibility'; // 접근성/UX

/** 프롬프트 훈련 시나리오 (6단계) */
export interface PromptScenario {
  /** 시나리오 ID */
  id: string;
  /** 시나리오 제목 (예: "사진 첨부 기능 추가") */
  title: string;
  /** 시나리오 상세 설명 */
  description: string;
  /** 관련 파일 경로들 */
  relatedFiles: string[];
}

/** 프롬프트 평가 결과 */
export interface PromptEvaluation {
  /** 총점 (0~100) */
  totalScore: number;
  /** 구체성 점수 (0~100) */
  specificityScore: number;
  /** 기술 용어 사용 점수 (0~100) */
  technicalTermScore: number;
  /** 완성도 점수 (0~100) */
  completenessScore: number;
  /** 부족한 점 설명 */
  feedback: string;
  /** 개선된 프롬프트 예시 */
  improvedPrompt: string;
}
