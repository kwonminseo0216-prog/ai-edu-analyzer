// ==========================================================================
// [Module Imports] 다른 24개 모듈들의 핵심 기능을 연결합니다.
// ==========================================================================
import { initStorage, saveKey, loadKey } from './storage.js';
import { initTheme, toggleTheme } from './account.js';
import { initTimer } from './timer.js';
import { initFileUpload } from './upload.js';
import { runAnalysisPipeline } from './analysis.js';
import { exportResultData } from './export.js';

// ==========================================================================
// [App State] 애플리케이션의 전역 상태 관리
// ==========================================================================
export const AppState = {
    isCompareMode: false,
    isAnalyzing: false,
    currentData: null
};

// ==========================================================================
// [DOM Elements] 자주 사용하는 DOM 요소 캐싱
// ==========================================================================
const DOM = {
    themeBtn: document.getElementById('theme-toggle-btn'),
    fontSizeSelect: document.getElementById('font-size-select'),
    compareBtn: document.getElementById('compare-mode-btn'),
    startBtn: document.getElementById('start-analysis-btn'),
    inputText2: document.getElementById('input-text-2'),
    loadingScreen: document.getElementById('loading-screen'),
    resultPanel: document.getElementById('result-panel'),
    tabButtons: document.querySelectorAll('.tab-menu .tab-btn'),
    tabPanes: document.querySelectorAll('.tab-contents .tab-pane'),
    exportTxtBtn: document.getElementById('export-txt-btn'),
    exportMdBtn: document.getElementById('export-md-btn'),
    printBtn: document.getElementById('print-btn')
};

// ==========================================================================
// [Initialization] 앱 시작점 (DOMContentLoaded)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. 설정 및 로컬스토리지 복구 데이터 로드 (storage, account 연동)
    initStorage();
    initTheme();
    initTimer();
    initFileUpload();
    
    // 2. 글로벌 이벤트 리스너 바인딩
    initGlobalEvents();
});

// ==========================================================================
// [Event Binding] 전역 UI 구성 요소 이벤트 연결
// ==========================================================================
function initGlobalEvents() {
    // 다크모드 버튼 바인딩
    DOM.themeBtn.addEventListener('click', () => {
        toggleTheme();
    });

    // 지문 비교 모드 토글 토글버튼
    DOM.compareBtn.addEventListener('click', () => {
        AppState.isCompareMode = !AppState.isCompareMode;
        DOM.inputText2.classList.toggle('hidden', !AppState.isCompareMode);
        DOM.compareBtn.classList.toggle('active', AppState.isCompareMode);
        DOM.compareBtn.innerText = AppState.isCompareMode ? "단일 모드" : "비교 모드";
    });

    // 탭 전환 시스템 연결
    DOM.tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetPaneId = e.target.getAttribute('data-target');
            switchTab(targetPaneId, e.target);
        });
    });

    // 분석 엔진 가동 버튼
    DOM.startBtn.addEventListener('click', handleStartAnalysis);

    // 내보내기 버튼 그룹 (export.js 연동)
    DOM.exportTxtBtn.addEventListener('click', () => exportResultData('txt'));
    DOM.exportMdBtn.addEventListener('click', () => exportResultData('md'));
    DOM.printBtn.addEventListener('click', () => window.print());
}

// ==========================================================================
// [Core Actions] 탭 전환 및 메인 로딩 스크린 제어
// ==========================================================================
function switchTab(paneId, activeBtn) {
    // 버튼 활성화 갱신
    DOM.tabButtons.forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');

    // 패널 내용 전환
    DOM.tabPanes.forEach(p => p.classList.remove('active'));
    document.getElementById(paneId).classList.add('active');
}

async function handleStartAnalysis() {
    if (AppState.isAnalyzing) return;

    const apiKey = document.getElementById('api-key-input').value.trim();
    const text1 = document.getElementById('input-text-1').value.trim();
    const text2 = document.getElementById('input-text-2').value.trim();
    const grade = document.getElementById('grade-select').value;

    if (!apiKey) { alert('OpenAI API Key를 정확히 입력해주세요.'); return; }
    if (!text1) { alert('분석할 본문 지문을 입력해 주세요.'); return; }

    // API Key 로컬스토리지 보관 유도
    saveKey(apiKey);

    try {
        // UI 로딩 락(Lock) 활성화
        setLoadingState(true);

        // 4. analysis.js 본 파이프라인으로 제어권 이양 및 결과 수신
        const result = await runAnalysisPipeline({ apiKey, text1, text2, grade, isCompareMode: AppState.isCompareMode });
        
        AppState.currentData = result;
        
        // 대시보드 잠금 해제
        DOM.resultPanel.classList.remove('locked');
        
    } catch (error) {
        console.error("[App Error] 지문 가공 분석 실패:", error);
        alert(`분석 중 에러가 발생했습니다:\n${error.message}`);
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    AppState.isAnalyzing = isLoading;
    DOM.loadingScreen.classList.toggle('hidden', !isLoading);
    DOM.startBtn.disabled = isLoading;
    DOM.startBtn.innerHTML = isLoading 
        ? `<i class="fa-solid fa-circle-notch fa-spin"></i> AI 연산 중...` 
        : `<i class="fa-solid fa-wand-magic-sparkles"></i> AI 심층 분석 시작`;
}
