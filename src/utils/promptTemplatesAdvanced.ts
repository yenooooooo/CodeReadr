/**
 * AI 프롬프트 템플릿 — 4~6단계 (심화)
 * 퀴즈, 코드 리뷰, 프롬프트 훈련용 프롬프트를 정의한다.
 * 모든 프롬프트에서 codeBlock은 핵심 3~5줄로 제한하여 JSON 잘림을 방지한다.
 */

import type { ProjectFile } from '@/types/project';
import { formatFilesForPrompt } from './promptUtils';

/**
 * 4단계: 퀴즈 출제 프롬프트
 * → 기대 응답: JSON (문제 3개, 각각 짧은 코드+질문+정답+해설)
 */
export function buildStep4Prompt(files: ProjectFile[]): string {
  return `
역할: 너는 코드 이해도를 평가하는 AI 시험관이야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어.

${formatFilesForPrompt(files)}

지시: 이 프로젝트 코드에서 3개의 퀴즈 문제를 출제해줘.
문제 유형을 섞어서: explanation, multiple_choice, short_answer

중요 규칙:
- codeBlock에는 핵심 코드 3~5줄만 넣어. 절대 긴 코드를 넣지 마.
- 각 답변과 해설은 2문장 이내로 짧게.
- JSON이 잘리지 않도록 전체 응답을 간결하게 유지해.

출력 형식: 반드시 아래 JSON 구조로만 응답해.
\`\`\`json
{
  "quizzes": [
    {
      "id": "quiz-1",
      "type": "explanation",
      "codeBlock": "핵심 코드 3줄",
      "filePath": "파일경로",
      "question": "질문",
      "choices": null,
      "correctAnswer": "짧은 모범답변",
      "explanation": "짧은 해설"
    }
  ]
}
\`\`\`

언어: 모든 설명은 한국어로 작성해.
`.trim();
}

/**
 * 4단계 (문서 전용): 개념 퀴즈 프롬프트
 * 코드가 아닌 문서 기반으로 프로젝트 이해도 퀴즈를 출제한다.
 */
export function buildStep4DocPrompt(files: ProjectFile[]): string {
  return `
역할: 너는 프로젝트 이해도를 평가하는 친절한 AI 선생님이야.

맥락: 아래에 프로젝트 설명 문서가 있어. 이건 코드가 아니라 프로젝트의 구조, 기능, 기술을 설명하는 문서야.

${formatFilesForPrompt(files)}

지시: 이 문서 내용을 바탕으로 3개의 퀴즈를 출제해줘.
문제 유형: explanation(개념 설명), multiple_choice(객관식), short_answer(단답)를 섞어서.

퀴즈 주제 예시:
- 프로젝트가 어떤 기능을 제공하는지
- 어떤 기술이 사용되고 왜 필요한지
- 프로젝트 구조가 어떻게 되어있는지
- 특정 기능이 왜 중요한지

중요 규칙:
- codeBlock 대신 문서에서 관련 내용 3~5줄을 발췌해서 넣어.
- 비개발자도 답할 수 있는 수준으로 출제해.
- 각 답변과 해설은 2문장 이내로 짧게.

출력 형식: 반드시 아래 JSON 구조로만 응답해.
\`\`\`json
{
  "quizzes": [
    {
      "id": "quiz-1",
      "type": "explanation",
      "codeBlock": "문서에서 발췌한 관련 내용 3~5줄",
      "filePath": "파일경로",
      "question": "질문",
      "choices": null,
      "correctAnswer": "짧은 모범답변",
      "explanation": "짧은 해설"
    }
  ]
}
\`\`\`

언어: 모든 설명은 한국어로 작성해.
`.trim();
}

/**
 * 5단계: 코드 리뷰 포인트 생성 프롬프트
 * → 기대 응답: JSON (리뷰 챌린지 3개)
 */
export function buildStep5Prompt(files: ProjectFile[]): string {
  return `
역할: 너는 시니어 개발자이자 코드 리뷰 트레이너야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어.

${formatFilesForPrompt(files)}

지시: 이 프로젝트 코드에서 개선할 수 있는 부분 3개를 찾아줘.
카테고리를 섞어서: security, performance, structure, error_handling, accessibility

중요 규칙:
- codeBlock과 improvedCode는 각각 핵심 3~5줄만 넣어.
- 힌트와 설명은 각각 1문장으로 짧게.
- JSON이 잘리지 않도록 전체 응답을 간결하게 유지해.

출력 형식:
\`\`\`json
{
  "challenges": [
    {
      "id": "review-1",
      "category": "security",
      "codeBlock": "문제 코드 3줄",
      "filePath": "파일경로",
      "hints": ["영역 힌트", "구체적 힌트", "정답 힌트"],
      "issue": "문제점 한 줄",
      "improvedCode": "개선 코드 3줄",
      "improvementReason": "이유 한 줄"
    }
  ]
}
\`\`\`

언어: 한국어로 작성해.
`.trim();
}

/**
 * 6단계: 프롬프트 훈련 시나리오 생성 프롬프트
 * → 기대 응답: JSON (시나리오 3개)
 */
export function buildStep6Prompt(files: ProjectFile[]): string {
  return `
역할: 너는 AI 프롬프트 엔지니어링 트레이너야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어.

${formatFilesForPrompt(files)}

지시: 이 프로젝트에 새 기능을 추가하는 시나리오 3개를 만들어줘.
각 시나리오는 실제로 이 프로젝트에 추가할 법한 현실적인 기능이어야 해.
설명은 2문장 이내로 짧게.

출력 형식:
\`\`\`json
{
  "scenarios": [
    {
      "id": "scenario-1",
      "title": "기능 제목",
      "description": "짧은 설명",
      "relatedFiles": ["파일1", "파일2"]
    }
  ]
}
\`\`\`

언어: 한국어로 작성해.
`.trim();
}
