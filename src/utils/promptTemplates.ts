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
1. 프로젝트가 무엇인지 한 줄 설명
2. 핵심 기능 3~5가지 (각각 10자 이내)
3. 폴더 트리: 최상위 폴더만 (하위 파일은 생략). description도 5자 이내.
4. 주요 파일 역할: 중요한 파일 최대 10개만. role은 10자 이내.

중요 규칙:
- 전문 용어는 괄호 안에 쉬운 설명 추가
- folderTree는 최상위 폴더 구조만. children 안에 파일 하나하나 넣지 마.
- fileRoles는 핵심 파일 10개 이내만. 설정 파일은 제외.
- JSON이 잘리지 않도록 모든 설명을 최대한 짧게 작성해.

출력 형식:
\`\`\`json
{
  "summary": "한 줄 요약",
  "keyFeatures": ["기능1", "기능2"],
  "folderTree": [
    { "name": "src", "type": "folder", "children": [{"name": "app", "type": "folder"}], "description": "소스코드" }
  ],
  "fileRoles": [
    { "path": "src/app/page.tsx", "role": "메인 페이지", "importance": 1 }
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

지시: 이 프로젝트에서 사용된 주요 기술 최대 6개를 식별해줘.
각각에 대해:
1. 기술명
2. 카테고리 (framework, library, tool, language, service 중 하나)
3. 비유 설명 (1~2문장)
4. 사용된 파일 경로 (최대 3개만)
5. 이 기술이 없으면? (1문장)

중요: 마이너 유틸 라이브러리는 제외. 핵심 기술만.

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

