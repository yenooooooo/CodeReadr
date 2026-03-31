/**
 * 프로젝트 분석 관련 타입 정의
 * 업로드된 프로젝트 파일과 AI 분석 결과의 구조를 정의한다.
 */

/** 업로드된 개별 파일 정보 */
export interface ProjectFile {
  /** 파일 경로 (예: "src/app/page.tsx") */
  path: string;
  /** 파일 내용 (텍스트) */
  content: string;
  /** 파일 확장자 (예: "tsx") */
  extension: string;
  /** 파일 크기 (bytes) */
  size: number;
}

/** AI가 분석한 프로젝트 구조 */
export interface ProjectStructure {
  /** 프로젝트 한 줄 설명 (비개발자용) */
  summary: string;
  /** 핵심 기능 목록 (3~5개) */
  keyFeatures: string[];
  /** 폴더 트리 구조 */
  folderTree: FolderNode[];
  /** 각 파일의 역할 요약 */
  fileRoles: FileRole[];
}

/** 폴더 트리의 노드 (폴더 또는 파일) */
export interface FolderNode {
  /** 이름 (예: "src", "page.tsx") */
  name: string;
  /** 노드 종류 */
  type: 'folder' | 'file';
  /** 하위 노드 (폴더인 경우) */
  children?: FolderNode[];
  /** 파일 역할 설명 (파일인 경우) */
  description?: string;
}

/** 개별 파일의 역할 요약 */
export interface FileRole {
  /** 파일 경로 */
  path: string;
  /** 역할 한 줄 설명 */
  role: string;
  /** 중요도 (1: 핵심, 2: 보조, 3: 설정) */
  importance: 1 | 2 | 3;
}

/** 프로젝트에서 사용된 기술 스택 정보 */
export interface TechStack {
  /** 기술명 (예: "Next.js") */
  name: string;
  /** 카테고리 (프레임워크, 라이브러리, 도구 등) */
  category: 'framework' | 'library' | 'tool' | 'language' | 'service';
  /** 비개발자용 비유 설명 */
  analogyDescription: string;
  /** 이 프로젝트에서의 구체적 용도 */
  projectUsage: string;
  /** 사용된 파일 경로 목록 */
  usedInFiles: string[];
  /** 이 기술이 없으면 어떤 문제가 생기는지 */
  whyNeeded: string;
}

/** localStorage에 저장되는 전체 프로젝트 데이터 */
export interface StoredProject {
  /** 프로젝트명 */
  name: string;
  /** 업로드된 파일 목록 */
  files: ProjectFile[];
  /** 분석 완료 시간 (ISO 문자열) */
  analyzedAt: string;
  /** AI가 분석한 프로젝트 구조 */
  structure: ProjectStructure;
  /** 식별된 기술 스택 */
  techStack: TechStack[];
}
