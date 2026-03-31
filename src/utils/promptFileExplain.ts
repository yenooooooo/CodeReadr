/**
 * 파일별 코드 설명 프롬프트
 * 3단계에서 개별 파일을 AI에게 보내 코드 블록 단위로 설명을 받는다.
 * 파일 1개당 프롬프트 1회로 토큰 효율적.
 */

/**
 * 개별 파일의 코드를 블록 단위로 설명 요청하는 프롬프트.
 * @param filePath - 파일 경로
 * @param content - 파일 내용
 * @returns 프롬프트 문자열
 */
export function buildFileExplainPrompt(filePath: string, content: string): string {
  // 너무 긴 파일은 앞부분만 (100줄)
  const lines = content.split('\n');
  const trimmed = lines.length > 100
    ? lines.slice(0, 100).join('\n') + `\n// ... (${lines.length - 100}줄 생략)`
    : content;

  return `
역할: 너는 코딩을 전혀 모르는 사람에게 코드를 가르치는 친절한 AI 선생님이야.

맥락: 아래는 "${filePath}" 파일의 코드야.

\`\`\`
${trimmed}
\`\`\`

지시: 이 코드를 관련된 줄끼리 묶어서 블록 단위로 설명해줘.
각 블록에 대해:
1. 시작줄~끝줄 번호
2. 그 코드가 하는 일을 비개발자도 이해할 수 있게 설명 (2~3문장)
3. 핵심 키워드가 있으면 괄호로 쉬운 설명 추가

중요: 블록은 최대 8개로 제한. 설명은 짧고 친절하게.

출력 형식:
\`\`\`json
{
  "fileName": "${filePath}",
  "summary": "이 파일 전체가 하는 일 한 줄 요약",
  "blocks": [
    {
      "startLine": 1,
      "endLine": 5,
      "title": "블록 제목 (예: 라이브러리 불러오기)",
      "explanation": "쉬운 설명"
    }
  ]
}
\`\`\`

언어: 모든 설명은 한국어로 작성해.
`.trim();
}

/** Gemini 응답 타입 — 파일별 코드 설명 */
export interface FileExplanation {
  fileName: string;
  summary: string;
  blocks: CodeBlock[];
}

/** 코드 블록 설명 */
export interface CodeBlock {
  startLine: number;
  endLine: number;
  title: string;
  explanation: string;
}
