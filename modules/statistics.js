// ==========================================================================
// [Storage Keys] 통계 데이터 누적을 위한 키값 세팅
// ==========================================================================
const STATS_KEYS = {
    TOTAL_ANALYZED: 'stats_total_analyzed_count',
    TOTAL_SOLVED_QUIZ: 'stats_total_solved_quiz_count',
    TOTAL_CORRECT_QUIZ: 'stats_total_correct_quiz_count'
};

/**
 * 21. 대시보드 상단 학습 통계 지표 실시간 갱신 및 데이터 주입 모듈
 * 지문 분석이 성공적으로 끝나거나 채점이 완료되었을 때 호출됩니다.
 */
export function updateStatistics() {
    try {
        // 1. 기존 누적 통계 값 로드 (없으면 0으로 초기화)
        let totalAnalyzed = parseInt(localStorage.getItem(STATS_KEYS.TOTAL_ANALYZED)) || 0;
        
        // 2. 새로운 지문 분석이 완료되었으므로 누적 카운트 1 증가
        totalAnalyzed++;
        localStorage.setItem(STATS_KEYS.TOTAL_ANALYZED, totalAnalyzed);

        // 3. UI 화면 디스플레이 동기화 갱신
        const analyzedDisplay = document.getElementById('stat-analyzed-count');
        if (analyzedDisplay) {
            analyzedDisplay.innerText = `${totalAnalyzed}개`;
        }

        // 종합 성취도 점수판 리렌더링 트리거
        calculateSuccessRateUI();

    } catch (error) {
        console.error("[Statistics Error] 통계 데이터 연산 실패:", error);
    }
}

/**
 * 21-1. 10번 grading.js 채점 결과 발생 시 누적 정답률을 다시 계산하는 연동 함수
 * @param {number} solvedCount - 이번 회차에 풀이한 문항 수
 * @param {number} correctCount - 이번 회차에 맞춘 정답 문항 수
 */
export function registerQuizResults(solvedCount, correctCount) {
    try {
        let currentSolved = parseInt(localStorage.getItem(STATS_KEYS.TOTAL_SOLVED_QUIZ)) || 0;
        let currentCorrect = parseInt(localStorage.getItem(STATS_KEYS.TOTAL_CORRECT_QUIZ)) || 0;

        // 누적 연산 더하기
        localStorage.setItem(STATS_KEYS.TOTAL_SOLVED_QUIZ, currentSolved + solvedCount);
        localStorage.setItem(STATS_KEYS.TOTAL_CORRECT_QUIZ, currentCorrect + correctCount);

        // 화면 갱신
        calculateSuccessRateUI();
    } catch (e) {
        console.error("퀴즈 결과 통계 저장 오류:", e);
    }
}

/**
 * 21-2. 누적 정답률 수식을 연산하여 상단 대시보드 배지에 주입하는 내부 헬퍼 함수
 */
function calculateSuccessRateUI() {
    const successRateDisplay = document.getElementById('stat-success-rate');
    if (!successRateDisplay) return;

    let totalSolved = parseInt(localStorage.getItem(STATS_KEYS.TOTAL_SOLVED_QUIZ)) || 0;
    let totalCorrect = parseInt(localStorage.getItem(STATS_KEYS.TOTAL_CORRECT_QUIZ)) || 0;

    // 분모가 0이 되는 것을 방지하기 위한 예외 처리 구조
    if (totalSolved === 0) {
        successRateDisplay.innerText = "0%";
        return;
    }

    // 종합 누적 정답률 백분율 연산
    let rate = Math.round((totalCorrect / totalSolved) * 100);
    successRateDisplay.innerText = `${rate}%`;
    
    // 성취도에 따른 동적 텍스트 색상 변화 가반 세팅
    if (rate >= 80) {
        successRateDisplay.style.color = 'var(--accent)'; // 80% 이상 에메랄드 초록
    } else if (rate >= 50) {
        successRateDisplay.style.color = 'var(--primary)'; // 50% 이상 인디고 블루
    } else {
        successRateDisplay.style.color = 'var(--warning)';
    }
}

/**
 * 앱 로드 시 최초 1회 저장소 데이터를 읽어 화면을 채워주는 초기화 훅
 */
(function initStatsOnLoad() {
    setTimeout(() => {
        const totalAnalyzed = parseInt(localStorage.getItem(STATS_KEYS.TOTAL_ANALYZED)) || 0;
        const analyzedDisplay = document.getElementById('stat-analyzed-count');
        if (analyzedDisplay) analyzedDisplay.innerText = `${totalAnalyzed}개`;
        calculateSuccessRateUI();
    }, 500);
})();
