import { AppState } from './app.js';

/**
 * 10. 고성능 자동 채점 및 종합 학습 스코어링 시스템
 * '시험지 채점하기' 버튼 클릭 시 트리거됩니다.
 */
export function initGradingSystem() {
    // 1. 현재 로드된 AI 분석 데이터 데이터 세트가 존재하는지 확인
    if (!AppState.currentData || !AppState.currentData.quiz) {
        alert("채점할 시험지 데이터가 없습니다. 먼저 지문 분석을 완료해주세요.");
        return;
    }

    const quizList = AppState.currentData.quiz;
    let totalQuestions = quizList.length;
    let correctCount = 0;
    
    // 문항당 점수 계산 (예: 4문항이면 문항당 25점)
    let scorePerQuestion = 100 / totalQuestions;

    // 2. 각 문항을 순회하며 채점 분석 시작
    quizList.forEach((q, idx) => {
        // 숨겨진 해설 및 정답 박스(6번 모듈에서 생성됨)를 활성화
        const explainBox = document.getElementById(`explain-${idx}`);
        if (explainBox) {
            explainBox.classList.remove('hidden');
        }

        // A. 객관식 / OX / 빈칸 추론 문항 채점 로직
        if (q.type === 'choice' || q.type === 'ox' || q.type === 'blank') {
            const selectedRadio = document.querySelector(`input[name="quiz-${idx}"]:checked`);
            const allLabels = document.querySelectorAll(`input[name="quiz-${idx}"]`);

            // 기존 스타일 초기화
            allLabels.forEach(radio => {
                radio.parentElement.style.backgroundColor = 'transparent';
                radio.parentElement.style.borderColor = 'var(--border-color)';
            });

            if (selectedRadio) {
                const userAnswer = parseInt(selectedRadio.value);
                const correctAnswer = parseInt(q.a);

                if (userAnswer === correctAnswer) {
                    // 정답인 경우: 초록색 강조 피드백
                    correctCount++;
                    selectedRadio.parentElement.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                    selectedRadio.parentElement.style.borderColor = 'var(--accent)';
                } else {
                    // 오답인 경우: 선택한 오답은 빨간색, 정답은 초록색으로 시각화 안내
                    selectedRadio.parentElement.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    selectedRadio.parentElement.style.borderColor = 'var(--danger)';
                    
                    // 정답 보기 추적 후 하이라이트
                    const correctRadio = document.querySelector(`input[name="quiz-${idx}"][value="${correctAnswer}"]`);
                    if (correctRadio) {
                        correctRadio.parentElement.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                        correctRadio.parentElement.style.borderColor = 'var(--accent)';
                    }
                }
            } else {
                // 아무것도 선택하지 않은 미풍 상태 처리
                const correctRadio = document.querySelector(`input[name="quiz-${idx}"][value="${q.a}"]`);
                if (correctRadio) {
                    correctRadio.parentElement.style.borderColor = 'var(--warning)';
                }
            }
        } 
        
        // B. 서술형 주관식 문항 키워드 매칭 채점 로직
        else if (q.type === 'essay') {
            const essayTextarea = document.getElementById(`essay-${idx}`);
            if (essayTextarea) {
                const userAnswer = essayTextarea.value.trim();
                
                // AI 정답 가이드에 지정된 쉼표/공백 기준 핵심 키워드 목록 추출
                const targetKeywords = q.a.split(/[, ]+/).filter(kw => kw.length > 1);
                
                // 유저의 답안에 핵심 키워드가 모두 채워져 있는지 유무 검사
                let isMatch = targetKeywords.every(kw => userAnswer.includes(kw));

                if (isMatch && userAnswer.length >= 10) {
                    correctCount++;
                    essayTextarea.style.borderColor = 'var(--accent)';
                    essayTextarea.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                } else {
                    essayTextarea.style.borderColor = 'var(--danger)';
                    essayTextarea.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                }
            }
        }
    });

    // 3. 종합 스코어 계산 및 대시보드 반영
    let finalScore = Math.round(correctCount * scorePerQuestion);
    
    // 21번 statistics.js 학습 통계 및 점수판 UI 업데이트 연동
    const scoreDisplay = document.getElementById('stat-total-count');
    if (scoreDisplay) {
        scoreDisplay.innerText = `${finalScore}점`;
    }

    alert(`📋 채점 리포트 수신 완료!\n\n- 맞은 문항: ${correctCount} / ${totalQuestions}\n- 최종 점수: ${finalScore}점\n\n하단 문항별 정답 해설 가이드를 확인하여 복습하세요.`);
}

// app.js와 연결을 위해 수동 바인딩용 초기화 내보내기 정의
document.getElementById('grading-btn')?.addEventListener('click', initGradingSystem);
