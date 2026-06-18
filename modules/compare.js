import { AppState } from './app.js';

/**
 * 18. 지문 비교 분석 모드 UI 토글 및 데이터 정제 제어 모듈
 */
export function toggleCompareMode() {
    const textInput2 = document.getElementById('input-text-2');
    const compareBtn = document.getElementById('compare-mode-btn');
    const compareBox = document.getElementById('compare-result-box');

    if (!textInput2 || !compareBtn || !compareBox) return;

    // 1. 전역 애플리케이션 상태(AppState)와 UI 동기화 전환
    AppState.isCompareMode = !AppState.isCompareMode;

    if (AppState.isCompareMode) {
        // 비교 모드 활성화: 두 번째 지문 입력 칸 노출
        textInput2.classList.remove('hidden');
        textInput2.focus();
        compareBtn.innerText = "단일 모드";
        compareBtn.style.backgroundColor = 'var(--primary)';
        compareBtn.style.color = '#ffffff';
    } else {
        // 비교 모드 비활성화: 입력 칸 숨김 및 내용 초기화
        textInput2.classList.add('hidden');
        textInput2.value = "";
        compareBtn.innerText = "비교 모드";
        compareBtn.style.backgroundColor = 'var(--bg-main)';
        compareBtn.style.color = 'var(--text-main)';
        
        // 기존에 출력되어 있던 비교 결과 리포트 창도 함께 숨김
        compareBox.classList.add('hidden');
    }
}

/**
 * 18-1. AI가 생성한 비교 대조 리포트 텍스트를 마크다운 혹은 표 형태로 깔끔하게 렌더링하는 함수
 * @param {string} compareData - analysis.js에서 파싱되어 넘어온 두 지문 대조 텍스트 데이터
 */
export function renderCompareResult(compareData) {
    const compareBox = document.getElementById('compare-result-box');
    const textArea = document.getElementById('compare-text-area');

    if (!compareBox || !textArea) return;

    if (!compareData || compareData === "단일 분석") {
        compareBox.classList.add('hidden');
        return;
    }

    // 2. 비교 분석 결과창 활성화 및 데이터 주입
    compareBox.classList.remove('hidden');
    
    // 줄바꿈 보존 및 가독성을 위한 스타일 적용 후 텍스트 반영
    textArea.style.whiteSpace = 'pre-wrap';
    textArea.style.fontSize = '0.9rem';
    textArea.style.lineHeight = '1.7';
    textArea.style.color = 'var(--text-main)';
    
    textArea.innerText = compareData;
}

// index.html 내의 버튼에 토글 이벤트 수동 연결 바인딩
document.getElementById('compare-mode-btn')?.addEventListener('click', toggleCompareMode);
