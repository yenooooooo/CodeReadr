/**
 * AI 평가 프롬프트 템플릿
 * 유저 답변/프롬프트를 AI가 평가할 때 사용하는 프롬프트.
 * 4단계(퀴즈 답변 평가), 6단계(프롬프트 품질 평가)에서 사용.
 */

/**
 * 4단계: 유저 답변 평가 프롬프트
 * → 기대 응답: JSON (점수, 잘한점, 부족한점, 모범답변)
 * @param question - 출제된 질문
 * @param codeBlock - 관련 코드 블록
 * @param correctAnswer - 정답
 * @param userAnswer - 유저가 작성한 답변
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
 * 6단계: 유저 프롬프트 평가
 * → 기대 응답: JSON (점수, 피드백, 개선된 프롬프트)
 * @param scenario - 시나리오 설명
 * @param relatedFiles - 관련 파일 경로 목록
 * @param userPrompt - 유저가 작성한 프롬프트
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
