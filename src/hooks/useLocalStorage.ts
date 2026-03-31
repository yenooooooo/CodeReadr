/**
 * localStorage 관리 훅
 * 브라우저 localStorage에 데이터를 저장/로드/삭제하는 React 훅.
 * useState와 동일하게 사용하되, 값이 localStorage에 영속된다.
 * SSR 하이드레이션 불일치를 방지하기 위해 마운트 후 로드한다.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * localStorage와 동기화되는 상태를 관리하는 커스텀 훅.
 * 서버에서는 항상 initialValue를 사용하고, 클라이언트 마운트 후
 * localStorage 값을 로드하여 하이드레이션 불일치를 방지한다.
 * @param key - localStorage 키 이름
 * @param initialValue - 저장된 값이 없을 때 사용할 초기값
 * @returns [저장된 값, 값 설정 함수, 값 삭제 함수]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  // 마운트 여부를 추적하여 SSR에서 localStorage 접근 방지
  const isMounted = useRef(false);
  // initialValue를 ref로 캡처하여 removeValue의 stale closure 방지
  const initialValueRef = useRef(initialValue);

  // 컴포넌트 마운트 시 localStorage에서 값 로드 (클라이언트에서만 실행)
  useEffect(() => {
    isMounted.current = true;
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
      setStoredValue(initialValueRef.current);
    } catch (error) {
      console.error(`localStorage 삭제 실패 [${key}]:`, error);
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}
