/**
 * 인증 관리 훅 (껍데기)
 * MVP에서는 항상 로그인 상태를 반환한다.
 * 향후 Supabase Auth 연동 시 이 파일만 수정하면 된다.
 */

'use client';

/** 유저 인증 정보 타입 */
interface AuthState {
  /** 로그인 여부 */
  isLoggedIn: boolean;
  /** 유저 고유 ID */
  userId: string;
  /** 유저 객체 (향후 Supabase User 타입으로 교체) */
  user: null;
}

/**
 * 유저 인증 상태를 반환하는 훅.
 * MVP 단계에서는 항상 로컬 유저로 로그인된 상태를 반환한다.
 * @returns 인증 상태 객체
 */
export function useAuth(): AuthState {
  // TODO: Supabase Auth 연동 시 교체
  return {
    isLoggedIn: true,
    userId: 'local-user',
    user: null,
  };
}
