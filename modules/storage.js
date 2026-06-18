// ==========================================================================
// [Storage Keys] 로컬스토리지에서 사용할 키값 정의
// ==========================================================================
const KEYS = {
    API_KEY: 'edu_analyzer_api_key',
    GRADE: 'edu_analyzer_grade',
    THEME: 'edu_analyzer_theme',
    FONT_SIZE: 'edu_analyzer_font_size'
};

/**
 * 8. 로컬 스토리지 초기화 및 기존 설정 데이터 복구 복원
 * app.js의 DOMContentLoaded 이벤트 핸들러 내부에서 호출됩니다.
 */
export function initStorage() {
    try {
        // 1. 저장되어 있는 API Key 복구 및 화면 주입
        const savedKey = loadKey();
        if (savedKey) {
            const keyInput = document.getElementById('api-key-input');
            if (keyInput) keyInput.value = savedKey;
        }

        // 2. 저장되어 있는 타겟 학년 정보 복구 및 셀렉트 박스 동기화
        const savedGrade = localStorage.getItem(KEYS.GRADE);
        if (savedGrade) {
            const gradeSelect = document.getElementById('grade-select');
            if (gradeSelect) gradeSelect.value = savedGrade;
        }

        // 3. 학년 선택이 변경될 때마다 로컬스토리지에 실시간 동기화 바인딩
        document.getElementById('grade-select')?.addEventListener('change', (e) => {
            localStorage.setItem(KEYS.GRADE, e.target.value);
        });

    } catch (error) {
        console.error("[Storage Error] 로컬 데이터를 읽어오는 중 오류 발생:", error);
    }
}

/**
 * 8-1. OpenAI API 키 암호화 보관 처리 유도 (최소한의 가반 보호)
 * @param {string} apiKey - 사용자가 입력한 API 키 문자열
 */
export function saveKey(apiKey) {
    if (!apiKey) return;
    try {
        // 브라우저 내장 btoa 함수를 이용해 키의 원문 노출을 방지하기 위한 인코딩 처리
        const encodedKey = btoa(apiKey);
        localStorage.setItem(KEYS.API_KEY, encodedKey);
    } catch (e) {
        console.error("키 저장 실패:", e);
    }
}

/**
 * 8-2. 보관된 API 키 복호화 복구
 * @returns {string|null} 기존에 등록했던 API 키 원문 반환
 */
export function loadKey() {
    try {
        const encodedKey = localStorage.getItem(KEYS.API_KEY);
        if (!encodedKey) return null;
        // 인코딩된 문자열을 원문으로 다시 디코딩 복구
        return atob(encodedKey);
    } catch (e) {
        console.clear(); // 파싱 에러 시 내부 흔적 삭제
        return null;
    }
}

/**
 * 8-3. 개별 모듈에서 범용적으로 사용할 수 있는 상태 저장소 헬퍼 인터페이스
 */
export function getSessionItem(key) {
    return localStorage.getItem(key);
}

export function setSessionItem(key, value) {
    localStorage.setItem(key, value);
}
