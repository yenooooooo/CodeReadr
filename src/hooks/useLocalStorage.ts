/**
 * localStorage 관리 훅
 * 브라우저 localStorage에 데이터를 저장/로드/삭제하는 React 훅.
 * useState와 동일하게 사용하되, 값이 localStorage에 영속된다.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * localStorage와 동기화되는 상태를 관리하는 커스텀 훅.
 * @param key - localStorage 키 이름
 * @param initialValue - 저장된 값이 없을 때 사용할 초기값
 * @returns [저장된 값, 값 설정 함수, 값 삭제 함수]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 초기값: localStorage에 저장된 값이 있으면 그것을, 없으면 initialValue 사용
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 컴포넌트 마운트 시 localStorage에서 값 로드 (SSR 호환)
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch (error) {
      console.error(`localStorage 로드 실패 [${key}]:`, error);
    }
  }, [key]);

  /** 값을 업데이트하고 localStorage에도 저장한다 */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          // 함수형 업데이트 지원 (setState와 동일한 패턴)
          const newValue = value instanceof Function ? value(prev) : value;
          localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      } catch (error) {
        console.error(`localStorage 저장 실패 [${key}]:`, error);
      }
    },
    [key]
  );

  /** localStorage에서 해당 키의 값을 삭제하고 초기값으로 리셋한다 */
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`localStorage 삭제 실패 [${key}]:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
