/**
 * AI 프롬프트 템플릿 모음
 * 모든 Gemini API 호출에 사용하는 프롬프트를 여기서 관리한다.
 * 각 학습 단계별로 역할(role), 맥락(context), 지시(instruction),
 * 출력 형식(format)을 명확히 구분하여 정의한다.
 */

import type { ProjectFile } from '@/types/project';
import { formatFilesForPrompt } from './promptUtils';

/**
 * 1단계: 프로젝트 전체 구조 분석 프롬프트
 * → 기대 응답: JSON (프로젝트 요약, 핵심 기능, 폴더 트리, 파일별 역할)
 * @param files - 업로드된 프로젝트 파일 배열
 * @returns 완성된 프롬프트 문자열
 */
export function buildStep1Prompt(files: ProjectFile[]): string {
  const fileContents = formatFilesForPrompt(files);

  return `
역할: 너는 코딩을 전혀 모르는 사람에게 프로젝트를 설명해주는 친절한 AI 선생님이야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어. 이 프로젝트를 분석해줘.

${fileContents}

지시: 위 프로젝트를 분석해서 다음 정보를 알려줘.
1. 프로젝트가 무엇인지 비개발자도 이해할 수 있는 한 줄 설명
2. 핵심 기능 3~5가지 (각각 한 줄 설명)
3. 폴더 트리 구조 (name, type, children, description 포함)
4. 각 파일의 역할 한 줄 요약 (path, role, importance)

중요: 전문 용어를 쓸 때는 반드시 괄호 안에 쉬운 설명을 추가해줘.

출력 형식: 반드시 아래 JSON 구조로만 응답해. 다른 텍스트 없이 JSON만 반환해.
\`\`\`json
{
  "summary": "이 프로젝트는 ...",
  "keyFeatures": ["기능1", "기능2", ...],
  "folderTree": [
    { "name": "src", "type": "folder", "children": [...], "description": "..." }
  ],
  "fileRoles": [
    { "path": "src/app/page.tsx", "role": "...", "importance": 1 }
  ]
}
\`\`\`

언어: 모든 설명은 한국어로 작성해.
`.trim();
}

/**
 * 2단계: 기술 스택 식별 및 설명 프롬프트
 * → 기대 응답: JSON (기술명, 비유 설명, 사용 위치, 필요 이유)
 * @param files - 업로드된 프로젝트 파일 배열
 * @returns 완성된 프롬프트 문자열
 */
export function buildStep2Prompt(files: ProjectFile[]): string {
  const fileContents = formatFilesForPrompt(files);

  return `
역할: 너는 코딩을 전혀 모르는 사람에게 기술 스택을 설명해주는 친절한 AI 선생님이야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어.

${fileContents}

지시: 이 프로젝트에서 사용된 모든 기술/프레임워크/라이브러리를 식별하고, 각각에 대해 알려줘.
1. 기술명
2. 카테고리 (framework, library, tool, language, service 중 하나)
3. 코딩을 전혀 모르는 사람도 이해할 수 있는 비유 설명 (3문장 이내)
4. 이 프로젝트에서 구체적으로 어디에 사용되었는지 (파일 경로 목록)
5. 이 기술이 없으면 어떤 문제가 생기는지

출력 형식: 반드시 아래 JSON 구조로만 응답해.
\`\`\`json
{
  "techStack": [
    {
      "name": "Next.js",
      "category": "framework",
      "analogyDescription": "...",
      "projectUsage": "...",
      "usedInFiles": ["src/app/page.tsx", ...],
      "whyNeeded": "..."
    }
  ]
}
\`\`\`

언어: 모든 설명은 한국어로 작성해.
`.trim();
}

/**
 * 3단계: 유저 행동별 코드 흐름 추적 프롬프트
 * → 기대 응답: JSON (행동명, 단계별 파일/함수/코드/설명)
 * @param files - 업로드된 프로젝트 파일 배열
 * @returns 완성된 프롬프트 문자열
 */
export function buildStep3Prompt(files: ProjectFile[]): string {
  const fileContents = formatFilesForPrompt(files);

  return `
역할: 너는 코드 흐름을 쉽게 설명해주는 AI 선생님이야.

맥락: 아래에 웹 프로젝트의 모든 파일이 있어.

${fileContents}

지시: 이 프로젝트에서 유저가 할 수 있는 주요 행동 5가지를 식별하고, 각 행동에 대해 코드가 실행되는 순서를 추적해줘.
각 단계마다:
1. 실행되는 파일명과 함수명
2. 해당 코드 블록 (시작줄~끝줄의 코드)
3. 이 코드가 하는 일을 비개발자도 이해할 수 있게 설명
4. 다음 단계로 넘어가는 이유

출력 형식: 반드시 아래 JSON 구조로만 응답해.
\`\`\`json
{
  "flows": [
    {
      "id": "flow-1",
      "actionName": "로그인할 때",
      "steps": [
        {
          "order": 1,
          "filePath": "src/app/page.tsx",
          "functionName": "handleLogin",
          "codeBlock": "코드 내용...",
          "startLine": 10,
          "endLine": 25,
          "explanation": "...",
          "transitionReason": "..."
        }
      ]
    }
  ]
}
\`\`\`

언어: 모든 설명은 한국어로 작성해.
`.trim();
}
