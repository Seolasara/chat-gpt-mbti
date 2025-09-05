// result.js
// result.html에서 로드됩니다.
// 로컬스토리지 key: "mbti_result"
// 여러 저장 형태에 대응하도록 작성했습니다.

// 유틸: 안전하게 JSON 파싱
function tryParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

// 유틸: 4글자 MBTI인지 검사 (A-Z)
function looksLikeMbtiString(s) {
  return typeof s === 'string' && /^[EISNTFJP]{4}$/i.test(s);
}

// 주어진 객체에서 각 이분법으로 문자 선택
// 기대하는 형태 예시들:
// 1) { E:3, I:0, S:2, N:1, T:2, F:1, J:3, P:0 }
// 2) { EI: 2, SN: 1, TF: 3, JP: 0 }  (숫자가 양수면 앞문자 유리라고 가정)
// 3) { e:3, i:1, ... } 등 소문자 허용
function computeMbtiFromCounts(obj) {
  if (!obj || typeof obj !== 'object') return null;

  // normalize keys to uppercase
  const counts = {};
  for (const k of Object.keys(obj)) {
    const K = String(k).toUpperCase();
    const v = Number(obj[k]);
    if (!Number.isNaN(v)) counts[K] = v;
  }

  // helper to pick between two letters
  const pick = (a, b) => {
    // direct counts for letters
    const ca = counts[a] ?? counts[a.toUpperCase()] ?? null;
    const cb = counts[b] ?? counts[b.toUpperCase()] ?? null;

    // if direct letter counts available, compare them
    if (ca !== null || cb !== null) {
      const na = ca ?? 0;
      const nb = cb ?? 0;
      if (na > nb) return a;
      if (nb > na) return b;
      // tie -> choose first (a) as deterministic fallback
      return a;
    }

    // otherwise check pair key like "EI" or "IE"
    const pair1 = (a + b).toUpperCase();
    const pair2 = (b + a).toUpperCase();
    if (pair1 in counts || pair2 in counts) {
      const v1 = counts[pair1] ?? 0;
      const v2 = counts[pair2] ?? 0;
      if (v1 > v2) return a;
      if (v2 > v1) return b;
      return a;
    }

    // finally check for generic keys like "EI_SCORE" etc (not required)
    // no useful data -> return first as fallback
    return a;
  };

  const c1 = pick('E', 'I');
  const c2 = pick('S', 'N');
  const c3 = pick('T', 'F');
  const c4 = pick('J', 'P');

  const candidate = (c1 + c2 + c3 + c4).toUpperCase();

  // validate
  if (/^[EISNTFJP]{4}$/.test(candidate)) return candidate;
  return null;
}

// 결과를 화면에 렌더링
function renderResultText(text) {
  const resultEl = document.getElementById('result');
  if (!resultEl) return;
  resultEl.textContent = text;
}

// 확장: MBTI 코드에서 한글 설명(간단) 매핑 (선택 사항)
const mbtiKoreanNames = {
  ISTJ: '논리적인 책임자 (ISTJ)',
  ISFJ: '헌신적인 수호자 (ISFJ)',
  INFJ: '통찰력 있는 상담자 (INFJ)',
  INTJ: '전략적인 계획자 (INTJ)',
  ISTP: '현실적인 기술자 (ISTP)',
  ISFP: '온화한 예술가 (ISFP)',
  INFP: '이상적인 중재자 (INFP)',
  INTP: '분석적인 사색가 (INTP)',
  ESTP: '활동적인 촉진자 (ESTP)',
  ESFP: '사교적인 연예인 (ESFP)',
  ENFP: '열정적인 활동가 (ENFP)',
  ENTP: '창의적인 발명가 (ENTP)',
  ESTJ: '결단력 있는 관리자 (ESTJ)',
  ESFJ: '사교적인 조력자 (ESFJ)',
  ENFJ: '영감을 주는 지도자 (ENFJ)',
  ENTJ: '단호한 지도자 (ENTJ)',
};

// 버튼 추가: 결과 복사
function createCopyButton(mbtiString) {
  // 이미 존재하면 교체하지 않음
  if (document.getElementById('copy-mbti-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'copy-mbti-btn';
  btn.type = 'button';
  btn.className = 'btn btn-outline-secondary mt-3';
  btn.textContent = 'MBTI 복사';

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(mbtiString);
      btn.textContent = '복사됨!';
      setTimeout(() => (btn.textContent = 'MBTI 복사'), 1500);
    } catch (e) {
      // 실패시 대체: 텍스트 선택하여 복사하도록 안내
      btn.textContent = '복사 불가 — 수동 복사하세요';
      setTimeout(() => (btn.textContent = 'MBTI 복사'), 2000);
    }
  });

  // restart-button 아래로 붙임 (result 엘리먼트와 동일한 컨테이너에 있다고 가정)
  const restartBtn = document.getElementById('restart-button');
  if (restartBtn && restartBtn.parentNode) {
    restartBtn.parentNode.insertBefore(btn, restartBtn.nextSibling);
  } else {
    document.body.appendChild(btn);
  }
}

// 페이지 로드 시 동작
document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('mbti_result');

  if (raw === null) {
    renderResultText('결과를 찾을 수 없습니다. 테스트를 먼저 완료하세요.');
    return;
  }

  // 1) 바로 4글자 문자열로 저장된 경우
  if (looksLikeMbtiString(raw)) {
    const mbti = raw.toUpperCase();
    const label = mbtiKoreanNames[mbti] ?? `당신의 MBTI: ${mbti}`;
    renderResultText(label);
    createCopyButton(mbti);
    return;
  }

  // 2) JSON으로 저장된 경우 (문자별 카운트 or 다른 구조)
  const parsed = tryParseJSON(raw);

  if (typeof parsed === 'string' && looksLikeMbtiString(parsed)) {
    const mbti = parsed.toUpperCase();
    renderResultText(mbtiKoreanNames[mbti] ?? `당신의 MBTI: ${mbti}`);
    createCopyButton(mbti);
    return;
  }

  // 3) 객체 형태에서 계산 시도
  const computed = computeMbtiFromCounts(parsed);
  if (computed) {
    renderResultText(mbtiKoreanNames[computed] ?? `당신의 MBTI: ${computed}`);
    createCopyButton(computed);
    return;
  }

  // 4) 마지막 시도: parsed가 배열이나 다른 형태이면, 간단히 stringify 해서 보여줌
  try {
    const fallback =
      typeof parsed === 'object' ? JSON.stringify(parsed) : String(parsed);
    renderResultText('알 수 없는 형식의 결과: ' + fallback);
  } catch (e) {
    renderResultText('결과를 읽어올 수 없습니다 (형식 오류).');
  }
});
