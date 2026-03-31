/**
 * AI 프롬프트 템플릿 — 4~6단계 (심화)
 * 퀴즈, 코드 리뷰, 프롬프트 훈련용 프롬프트를 정의한다.
 */

import type { ProjectFile } from '@/types/project';

/** 파일 목록을 프롬프트용 텍스트로 변환 */
function formatFiles(files: ProjectFile[]): string {
  return files.map((f) => `--- 파일: ${f.path} ---\n${f.content}`).join('\n\n');
}

/**
 * 4단계: 퀴즈 출제 프롬프트
 * → 기대 응답: JSON (문제 목록, 각각 코드블록+질문+정답+해설)
 */
export function buildStep4Prompt(files: ProjectFile[]): string {
  return `
역할: 너는 코드 이해도를 평가하는 AI 시험관이야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어.

${formatFiles(files)}

지시: 이 프로젝트 코드에서 5개의 퀴즈 문제를 출제해줘.
문제 유형을 섞어서 만들어:
- "explanation": 이 함수/코드가 하는 일을 설명하세요 (서술형)
- "multiple_choice": 이 코드의 실행 결과는? (객관식 4지선다)
- "short_answer": 이 변수/컴포넌트의 역할은? (단답형)

각 문제에는 해당 코드 블록, 파일 경로를 포함해.
비개발자도 이해할 수 있는 해설을 작성해줘.

출력 형식: 반드시 아래 JSON 구조로만 응답해.
\`\`\`json
{
  "quizzes": [
    {
      "id": "quiz-1",
      "type": "explanation",
      "codeBlock": "관련 코드...",
      "filePath": "src/app/page.tsx",
      "question": "이 함수가 하는 일을 설명해보세요.",
      "choices": null,
      "correctAnswer": "모범 답변...",
      "explanation": "해설..."
    },
    {
      "id": "quiz-2",
      "type": "multiple_choice",
      "codeBlock": "관련 코드...",
      "filePath": "src/utils/api.ts",
      "question": "이 코드의 실행 결과는?",
      "choices": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctAnswer": "정답 선택지",
      "explanation": "해설..."
    }
  ]
}
\`\`\`

언어: 모든 설명은 한국어로 작성해.
`.trim();
}

/**
 * 4단계: 유저 답변 평가 프롬프트
 * → 기대 응답: JSON (점수, 잘한점, 부족한점, 모범답변)
 */
export function buildQuizEvalPrompt(
  question: string, codeBlock: string, correctAnswer: string, userAnswer: string
): string {
  return `
역할: 너는 코딩 교육 전문 평가자야.

맥락:
문제: ${question}
관련 코드: ${codeBlock}
정답: ${correctAnswer}
학생 답변: ${userAnswer}

지시: 학생의 답변을 0~100점으로 평가하고 피드백을 줘.

출력 형식:
\`\`\`json
{
  "score": 75,
  "strengths": "잘한 점...",
  "weaknesses": "부족한 점...",
  "modelAnswer": "이렇게 답하면 완벽해요: ..."
}
\`\`\`

언어: 한국어로 작성해. 비개발자도 이해할 수 있게 친절하게.
`.trim();
}

/**
 * 5단계: 코드 리뷰 포인트 생성 프롬프트
 * → 기대 응답: JSON (리뷰 챌린지 목록)
 */
export function buildStep5Prompt(files: ProjectFile[]): string {
  return `
역할: 너는 시니어 개발자이자 코드 리뷰 트레이너야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어.

${formatFiles(files)}

지시: 이 프로젝트 코드에서 개선할 수 있는 부분 5개를 찾아줘.
카테고리를 섞어서:
- security: 보안 취약점
- performance: 성능 이슈
- structure: 코드 구조 문제
- error_handling: 에러 처리 누락
- accessibility: 접근성/UX 문제

각 항목에 3단계 힌트를 포함해:
- 힌트1: 어떤 영역을 봐야 하는지 (넓은 범위)
- 힌트2: 구체적으로 뭘 확인해야 하는지
- 힌트3: 정답에 가까운 구체적 설명

출력 형식:
\`\`\`json
{
  "challenges": [
    {
      "id": "review-1",
      "category": "security",
      "codeBlock": "문제가 있는 코드...",
      "filePath": "src/utils/api.ts",
      "hints": ["영역 힌트", "구체적 힌트", "정답 힌트"],
      "issue": "문제점 설명...",
      "improvedCode": "개선된 코드...",
      "improvementReason": "왜 이렇게 고쳐야 하는지..."
    }
  ]
}
\`\`\`

언어: 한국어로 작성해.
`.trim();
}

/**
 * 6단계: 프롬프트 훈련 시나리오 생성 프롬프트
 * → 기대 응답: JSON (시나리오 목록)
 */
export function buildStep6Prompt(files: ProjectFile[]): string {
  return `
역할: 너는 AI 프롬프트 엔지니어링 트레이너야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어.

${formatFiles(files)}

지시: 이 프로젝트에 새 기능을 추가하는 시나리오 5개를 만들어줘.
각 시나리오는 실제로 이 프로젝트에 추가할 법한 현실적인 기능이어야 해.

출력 형식:
\`\`\`json
{
  "scenarios": [
    {
      "id": "scenario-1",
      "title": "기능 제목",
      "description": "이런 기능을 추가하고 싶어요: ...",
      "relatedFiles": ["src/app/page.tsx", "src/utils/api.ts"]
    }
  ]
}
\`\`\`

언어: 한국어로 작성해.
`.trim();
}

/**
 * 6단계: 유저 프롬프트 평가
 * → 기대 응답: JSON (점수, 피드백, 개선된 프롬프트)
 */
export function buildPromptEvalPrompt(
  scenario: string, relatedFiles: string[], userPrompt: string
): string {
  return `
역할: 너는 AI 프롬프트 품질 평가 전문가야.

맥락:
시나리오: ${scenario}
관련 파일: ${relatedFiles.join(', ')}
학생이 작성한 프롬프트: ${userPrompt}

지시: 이 프롬프트를 3가지 기준으로 평가해:
1. 구체성 (어떤 파일을 수정해야 하는지 언급?)
2. 기술 용어 (정확한 기술 용어 사용?)
3. 완성도 (빠뜨린 단계 없는지?)

출력 형식:
\`\`\`json
{
  "totalScore": 75,
  "specificityScore": 80,
  "technicalTermScore": 70,
  "completenessScore": 75,
  "feedback": "부족한 점 설명...",
  "improvedPrompt": "이렇게 쓰면 더 좋아요: ..."
}
\`\`\`

언어: 한국어로 작성해.
`.trim();
}
