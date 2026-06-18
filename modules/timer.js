import { initGradingSystem } from './grading.js';

// ==========================================================================
// [Timer State Variables] 타이머 제어를 위한 내부 상태 변수
// ==========================================================================
let timerIntervalId = null;
let remainingTimeInSeconds = 0;

/**
 * 20. 학습용 타임어택 스톱워치/카운트다운 시스템 초기화
 * @param {number} minutes - 설정할 제한 시간 (분 단위, 기본값 15분)
 */
export function startExamTimer(minutes = 15) {
    const timerDisplay = document.getElementById('timer-display');
    const timerToggleBtn = document.getElementById('timer-toggle-btn');
    
    if (!timerDisplay || !timerToggleBtn) return;

    // 1. 이미 작동 중인 타이머가 있다면 초기화하고 재시작
    clearInterval(timerIntervalId);

    // 2. 분 단위를 초 단위로 환산하여 상태 세팅
    remainingTimeInSeconds = minutes * 60;
    updateTimerDisplay(remainingTimeInSeconds);

    timerToggleBtn.innerHTML = `<i class="fa-solid fa-pause"></i> 타이머 일시정지`;
    timerToggleBtn.style.backgroundColor = 'var(--warning)';

    // 3. 1초(1000ms)마다 주기적으로 반복 연산하는 인터벌 구동
    timerIntervalId = setInterval(() => {
        remainingTimeInSeconds--;

        // 4. 화면 디스플레이 실시간 업데이트
        updateTimerDisplay(remainingTimeInSeconds);

        // 5. 제한 시간 만료 시 타이머 종료 처리 파이프라인
        if (remainingTimeInSeconds <= 0) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
            
            timerDisplay.innerText = "00:00 - 시간 만료";
            timerDisplay.style.color = 'var(--danger)';
            
            alert("⏰ 실전 풀이 제한 시간이 종료되었습니다!\n제출된 답안을 바탕으로 자동 채점을 진행합니다.");
            
            // 10번 grading.js 채점 엔진 강제 호출 유도
            initGradingSystem();
        }
    }, 1000);
}

/**
 * 20-1. 타이머 작동 일시정지 및 재개(Resume) 토글 컨트롤러
 */
export function toggleExamTimer() {
    const timerToggleBtn = document.getElementById('timer-toggle-btn');
    if (!timerToggleBtn) return;

    if (timerIntervalId) {
        // 현재 작동 중이면 ➔ 일시정지 상태로 전환
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        timerToggleBtn.innerHTML = `<i class="fa-solid fa-play"></i> 타이머 재개`;
        timerToggleBtn.style.backgroundColor = 'var(--primary)';
    } else {
        // 정지 상태이면 ➔ 남은 시간 기준으로 재가동 (분 단위 환산 계산)
        const currentMinutes = remainingTimeInSeconds / 60;
        startExamTimer(currentMinutes);
    }
}

/**
 * 20-2. 초 단위를 시각적인 분:초(MM:SS) 포맷으로 변환하여 UI 화면을 주입하는 내부 헬퍼 함수
 */
function updateTimerDisplay(totalSeconds) {
    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) return;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    timerDisplay.innerText = `${formattedMinutes}:${formattedSeconds}`;

    // 시간이 1분 미만으로 남았을 때 학습자에게 긴장감을 주는 경고 색상 피드백 적용
    if (totalSeconds < 60) {
        timerDisplay.style.color = 'var(--danger)';
        timerDisplay.style.fontWeight = '800';
    } else {
        timerDisplay.style.color = 'var(--text-main)';
        timerDisplay.style.fontWeight = '600';
    }
}
