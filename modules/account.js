import { refreshMermaidTheme } from './mermaid.js';

// ==========================================================================
// [Storage Keys] 상태 보관을 위한 키값 설정
// ==========================================================================
const THEME_KEY = 'edu_analyzer_theme';
const FONT_SIZE_KEY = 'edu_analyzer_font_size';

/**
 * 19. 테마 및 글꼴 제어 시스템 초기화
 * app.js 시작 단계에서 호출됩니다.
 */
export function initTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const fontSizeSelect = document.getElementById('font-size-select');

    // 1. 기존에 저장되어 있던 테마 복구 적용
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 저장된 테마가 있으면 그것을 따르고, 없으면 시스템 환경 설정을 반영
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
        if (themeBtn) themeBtn.innerHTML = `<i class="fa-solid fa-sun"></i> 라이트모드`;
    } else {
        document.documentElement.classList.remove('dark');
        if (themeBtn) themeBtn.innerHTML = `<i class="fa-solid fa-moon"></i> 다크모드`;
    }

    // 2. 기존에 저장되어 있던 글자 크기 복구 적용
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) || 'medium';
    if (fontSizeSelect) {
        fontSizeSelect.value = savedFontSize;
        applyFontSize(savedFontSize);
    }

    // 3. 글자 크기 변경 셀렉트 박스 이벤트 바인딩
    fontSizeSelect?.addEventListener('change', (e) => {
        const size = e.target.value;
        localStorage.setItem(FONT_SIZE_KEY, size);
        applyFontSize(size);
    });
}

/**
 * 19-1. 다크모드 ➔ 라이트모드 상태 실시간 토글 제어
 */
export function toggleTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const isDark = document.documentElement.classList.toggle('dark');

    // 스토리지 상태 기록 업데이트
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');

    if (themeBtn) {
        themeBtn.innerHTML = isDark 
            ? `<i class="fa-solid fa-sun"></i> 라이트모드` 
            : `<i class="fa-solid fa-moon"></i> 다크모드`;
    }

    // 15번 mermaid.js 엔진에 다크모드 변경을 통보하여 다이어그램 색상 동기화
    refreshMermaidTheme();
}

/**
 * 19-2. 선택된 단계별 글자 크기 스케일링 핵심 로직
 * 최상위 body 엘리먼트에 클래스를 주입하여 전역 CSS 변수의 폰트 배율을 일괄 조정합니다.
 */
function applyFontSize(size) {
    const body = document.body;
    
    // 기존 폰트 사이즈 클래스 일괄 제거
    body.classList.remove('font-small', 'font-medium', 'font-large');

    // 선택된 폰트 크기 클래스 주입
    if (size === 'small') {
        body.classList.add('font-small');
    } else if (size === 'large') {
        body.classList.add('font-large');
    } else {
        body.classList.add('font-medium'); // 기본값
    }
}
