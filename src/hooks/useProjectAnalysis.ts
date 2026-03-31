/**
 * 프로젝트 분석 훅
 * Gemini API를 호출하여 프로젝트를 분석하고
 * 결과를 localStorage에 저장하는 로직을 캡슐화한다.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/hooks/useStorage';
import { callGeminiJSON } from '@/utils/gemini';
import { buildStep1Prompt, buildStep2Prompt } from '@/utils/promptTemplates';
import { STORAGE_KEYS, UI_TEXT } from '@/constants';
import type { ProjectFile, ProjectStructure, TechStack, StoredProject } from '@/types/project';

/** 로그 항목 타입 */
export interface LogItem {
  time: string;
  level: string;
  message: string;
}

/** 현재 시간을 HH:MM:SS 형식으로 반환 */
function getTimeString(): string {
  return new Date().toTimeString().slice(0, 8);
}

/** 훅 반환 타입 */
interface UseProjectAnalysisReturn {
  isAnalyzing: boolean;
  logs: LogItem[];
  addLog: (level: string, message: string) => void;
  runAnalysis: (files: ProjectFile[]) => Promise<void>;
}

/**
 * Gemini API를 통한 프로젝트 분석 + localStorage 저장 + 라우팅을 관리하는 훅.
 * @returns 분석 상태, 로그, 분석 실행 함수
 */
export function useProjectAnalysis(): UseProjectAnalysisReturn {
  const router = useRouter();
  const { save } = useStorage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // setTimeout ID를 저장하여 언마운트 시 cleanup
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);
  const [logs, setLogs] = useState<LogItem[]>([
    { time: getTimeString(), level: 'READY', message: 'Waiting for ingestion stream...' },
    { time: getTimeString(), level: 'INFO', message: 'Engine v2.4 initialized. Modules connected.' },
  ]);

  /** 로그 추가 */
  const addLog = useCallback((level: string, message: string) => {
    setLogs((prev) => [{ time: getTimeString(), level, message }, ...prev]);
  }, []);

  /** Gemini API로 프로젝트 분석 실행 */
  const runAnalysis = useCallback(async (files: ProjectFile[]) => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    addLog('START', `Analyzing ${files.length} files...`);

    try {
      // 1단계: 프로젝트 구조 분석 (순차 실행 — 무료 티어 분당 5회 제한 대응)
      addLog('SCAN', 'Running project structure analysis...');
      const structure = await callGeminiJSON<ProjectStructure>(buildStep1Prompt(files));
      addLog('OK', 'Project structure analysis complete.');

      // 2단계: 기술 스택 식별
      addLog('SCAN', 'Identifying tech stack...');
      const techResult = await callGeminiJSON<{ techStack: TechStack[] }>(buildStep2Prompt(files));
      addLog('OK', `Identified ${techResult.techStack.length} technologies.`);

      // localStorage에 저장
      const project: StoredProject = {
        name: structure.summary.slice(0, 50),
        files,
        analyzedAt: new Date().toISOString(),
        structure,
        techStack: techResult.techStack,
      };
      save(STORAGE_KEYS.PROJECT, project);
      addLog('DONE', 'Analysis saved. Redirecting to learning module...');

      redirectTimerRef.current = setTimeout(() => router.push('/learn'), 800);
    } catch (err) {
      console.error('Gemini 분석 에러:', err);
      addLog('ERROR', UI_TEXT.ERROR_API_FAILED);
    } finally {
      setIsAnalyzing(false);
    }
  }, [addLog, save, router]);

  return { isAnalyzing, logs, addLog, runAnalysis };
}
