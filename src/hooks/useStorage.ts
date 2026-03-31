/**
 * 스토리지 래퍼 훅
 * MVP에서는 localStorage를 사용하고,
 * 향후 Supabase로 교체할 때 이 파일만 수정하면 된다.
 */

'use client';

import { useCallback } from 'react';

/** 스토리지 인터페이스 */
interface StorageActions {
  /** 데이터 저장 */
  save: (key: string, data: unknown) => void;
  /** 데이터 로드 (없으면 null 반환) */
  load: <T>(key: string) => T | null;
  /** 데이터 삭제 */
  remove: (key: string) => void;
}

/**
 * 스토리지 작업을 추상화하는 훅.
 * MVP에서는 localStorage 직접 사용, 나중에 Supabase로 교체 예정.
 * @returns save, load, remove 메서드를 가진 객체
 */
export function useStorage(): StorageActions {
  /** 데이터를 JSON으로 직렬화하여 localStorage에 저장 */
  const save = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`스토리지 저장 실패 [${key}]:`, error);
    }
  }, []);

  /** localStorage에서 데이터를 로드하고 JSON 파싱하여 반환 */
  const load = useCallback(<T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(`스토리지 로드 실패 [${key}]:`, error);
      return null;
    }
  }, []);

  /** localStorage에서 해당 키 삭제 */
  const remove = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`스토리지 삭제 실패 [${key}]:`, error);
    }
  }, []);

  return { save, load, remove };
}
