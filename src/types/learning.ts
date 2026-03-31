/**
 * 학습 관련 타입 정의
 * 6단계 학습 시스템의 진행 상태와 콘텐츠 구조를 정의한다.
 */

/** 학습 단계 번호 (1~6) */
export type LearningStep = 1 | 2 | 3 | 4 | 5 | 6;

/** 학습 단계 정보 */
export interface LearningStepInfo {
  /** 단계 번호 */
  step: LearningStep;
  /** 단계 제목 */
  title: string;
  /** 단계 설명 */
  description: string;
  /** 단계 아이콘 (이모지) */
  icon: string;
  /** 난이도 표시 */
  difficulty: '입문' | '기초' | '중급' | '심화' | '최종' | '실전';
}

/** 코드 따라읽기(3단계)에서 유저 행동 흐름 */
export interface UserFlow {
  /** 흐름 ID */
  id: string;
  /** 행동 이름 (예: "로그인할 때") */
  actionName: string;
  /** 코드 실행 순서 단계들 */
  steps: CodeFlowStep[];
}

/** 코드 흐름의 개별 단계 */
export interface CodeFlowStep {
  /** 단계 순서 */
  order: number;
  /** 파일 경로 */
  filePath: string;
  /** 함수명 */
  functionName: string;
  /** 코드 블록 (해당 부분) */
  codeBlock: string;
  /** 시작 줄 번호 */
  startLine: number;
  /** 끝 줄 번호 */
  endLine: number;
  /** 비개발자용 설명 */
  explanation: string;
  /** 다음 단계로 넘어가는 이유 */
  transitionReason: string;
}

/** 학습 진행 상태 (localStorage에 저장) */
export interface LearningProgress {
  /** 현재 학습 단계 (1~6) */
  currentStep: LearningStep;
  /** 완료한 토픽 ID 목록 */
  completedTopics: string[];
  /** 퀴즈 점수 기록 */
  quizScores: QuizScoreRecord[];
  /** 전체 진행률 (0~100) */
  totalProgress: number;
}

/** 퀴즈 점수 기록 */
export interface QuizScoreRecord {
  /** 퀴즈 ID */
  quizId: string;
  /** 점수 (0~100) */
  score: number;
  /** 응시 시간 (ISO 문자열) */
  attemptedAt: string;
}

/** 학습 히스토리 (localStorage에 저장) */
export interface LearningHistory {
  /** AI와의 대화 기록 */
  conversations: ChatMessage[];
  /** 북마크한 코드 블록 */
  bookmarks: Bookmark[];
}

/** AI 대화 메시지 */
export interface ChatMessage {
  /** 메시지 ID */
  id: string;
  /** 발신자 */
  role: 'user' | 'ai';
  /** 메시지 내용 */
  content: string;
  /** 발신 시간 (ISO 문자열) */
  timestamp: string;
}

/** 북마크된 코드 블록 */
export interface Bookmark {
  /** 북마크 ID */
  id: string;
  /** 파일 경로 */
  filePath: string;
  /** 코드 블록 */
  codeBlock: string;
  /** 사용자 메모 */
  note: string;
  /** 생성 시간 (ISO 문자열) */
  createdAt: string;
}
