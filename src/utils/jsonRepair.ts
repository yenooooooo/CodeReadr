/**
 * 잘린 JSON 복구 유틸리티
 * Gemini API가 토큰 제한으로 불완전한 JSON을 반환할 때
 * 닫히지 않은 괄호/따옴표를 보정하여 파싱 가능하게 만든다.
 */

/**
 * 토큰 제한으로 잘린 불완전한 JSON을 복구 시도한다.
 * @param json - 잘린 JSON 문자열
 * @returns 복구된 JSON 문자열
 */
export function repairTruncatedJSON(json: string): string {
  // 마지막 완전한 객체/배열 항목까지 자르기
  let repaired = json
    .replace(/,\s*$/, '')          // 끝의 trailing comma 제거
    .replace(/,\s*}\s*$/, '}')     // ,} → }
    .replace(/,\s*]\s*$/, ']');    // ,] → ]

  // 닫히지 않은 문자열 닫기 (홀수 개 따옴표)
  const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    repaired += '"';
  }

  // 닫히지 않은 괄호/대괄호 보정
  const opens = { '{': 0, '[': 0 };
  let inString = false;
  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (ch === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
      inString = !inString;
    }
    if (inString) continue;
    if (ch === '{') opens['{']++;
    if (ch === '}') opens['{']--;
    if (ch === '[') opens['[']++;
    if (ch === ']') opens['[']--;
  }

  // 부족한 닫는 괄호 추가
  repaired += ']'.repeat(Math.max(0, opens['[']));
  repaired += '}'.repeat(Math.max(0, opens['{']));

  return repaired;
}
