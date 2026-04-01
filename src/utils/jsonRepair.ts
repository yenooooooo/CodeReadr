/**
 * 잘린 JSON 복구 유틸리티
 * Gemini API가 토큰 제한으로 불완전한 JSON을 반환할 때
 * 마지막 완전한 항목까지 되돌린 뒤 괄호를 보정한다.
 */

/**
 * 토큰 제한으로 잘린 불완전한 JSON을 복구 시도한다.
 * 1단계: 마지막 완전한 객체/배열 항목까지 되돌리기
 * 2단계: 닫히지 않은 따옴표/괄호 보정
 * @param json - 잘린 JSON 문자열
 * @returns 복구된 JSON 문자열
 */
export function repairTruncatedJSON(json: string): string {
  let repaired = json;

  // 1단계: 마지막 완전한 항목까지 잘라내기
  // 마지막으로 완결된 key-value 쌍 또는 배열 항목의 끝을 찾는다
  // 완결 마커: }, ], "값" 뒤의 쉼표 또는 닫는 괄호
  const lastGoodEnd = findLastCompletePoint(repaired);
  if (lastGoodEnd > 0 && lastGoodEnd < repaired.length - 1) {
    repaired = repaired.slice(0, lastGoodEnd + 1);
  }

  // trailing comma 정리
  repaired = repaired
    .replace(/,\s*$/, '')
    .replace(/,\s*}\s*$/, '}')
    .replace(/,\s*]\s*$/, ']');

  // 2단계: 닫히지 않은 따옴표 보정
  const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    repaired += '"';
  }

  // 3단계: 닫히지 않은 괄호/대괄호 보정
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

  repaired += ']'.repeat(Math.max(0, opens['[']));
  repaired += '}'.repeat(Math.max(0, opens['{']));

  return repaired;
}

/**
 * JSON 문자열에서 마지막으로 완전히 닫힌 객체/배열의 위치를 찾는다.
 * 문자열 중간에서 잘린 경우 그 앞의 마지막 }, ] 또는 완전한 "값" 위치를 반환.
 */
function findLastCompletePoint(json: string): number {
  let lastGood = -1;
  let inString = false;
  let depth = 0;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (ch === '"' && (i === 0 || json[i - 1] !== '\\')) {
      inString = !inString;
      // 문자열이 닫힌 직후를 후보로 기록
      if (!inString) lastGood = i;
      continue;
    }

    if (inString) continue;

    if (ch === '{' || ch === '[') {
      depth++;
    } else if (ch === '}' || ch === ']') {
      depth--;
      lastGood = i; // 완전히 닫힌 객체/배열 위치
    }
  }

  return lastGood;
}
