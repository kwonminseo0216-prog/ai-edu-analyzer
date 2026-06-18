/**
 * 6. AI 적중 변형 문제지 동적 렌더링 모듈
 * analysis.js에서 파싱된 퀴즈 JSON 세트를 받아와 HTML 인터페이스로 빌드합니다.
 */
export function renderQuiz(quizArray) {
    const container = document.getElementById('quiz-container');
    
    // 1. 기존에 생성되어 있던 문제 영역 초기화
    container.innerHTML = '';

    if (!quizArray || quizArray.length === 0) {
        container.innerHTML = `<p class="text-muted p-4 text-center">생성된 예상 문제가 없습니다. 지문을 먼저 분석해주세요.</p>`;
        return;
    }

    // 2. 퀴즈 배열을 순회하며 유형별(객관식, OX, 빈칸, 서술형) UI 동적 생성
    quizArray.forEach((q, idx) => {
        const quizCard = document.createElement('div');
        quizCard.className = 'card quiz-item-card';
        quizCard.style.borderLeft = '4px solid var(--primary)';
        quizCard.style.marginBottom = '1rem';

        // 문제 제목(발문) 영역
        const questionTitle = document.createElement('h5');
        questionTitle.className = 'quiz-question-title';
        questionTitle.style.fontWeight = '600';
        questionTitle.style.marginBottom = '0.75rem';
        questionTitle.innerText = q.q;
        quizCard.appendChild(questionTitle);

        // 3. 문항 유형별 정밀 분기 처리
        if (q.type === 'choice' || q.type === 'ox' || q.type === 'blank') {
            // 선택형 문항 래퍼
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'quiz-options-group';
            optionsContainer.style.display = 'flex';
            optionsContainer.style.flexDirection = 'column';
            optionsContainer.style.gap = '0.5rem';

            q.o.forEach((optionText, oIdx) => {
                const label = document.createElement('label');
                label.className = 'quiz-option-label';
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.gap = '0.5rem';
                label.style.padding = '0.5rem 0.75rem';
                label.style.border = '1px solid var(--border-color)';
                label.style.borderRadius = '6px';
                label.style.cursor = 'pointer';
                label.style.fontSize = '0.9rem';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `quiz-${idx}`;
                radio.value = oIdx;
                radio.style.cursor = 'pointer';

                label.appendChild(radio);
                label.appendChild(document.createTextNode(` ${optionText}`));
                optionsContainer.appendChild(label);
            });
            quizCard.appendChild(optionsContainer);

        } else if (q.type === 'essay') {
            // 서술형 주관식 입력창 렌더링
            const textarea = document.createElement('textarea');
            textarea.id = `essay-${idx}`;
            textarea.rows = 3;
            textarea.placeholder = "여기에 정답과 핵심 근거를 서술하세요 (채점 시 AI 핵심 키워드 매칭 검사 수행)...";
            textarea.style.width = '100%';
            textarea.style.padding = '0.5rem';
            textarea.style.borderRadius = '6px';
            textarea.style.border = '1px solid var(--border-color)';
            textarea.style.backgroundColor = 'var(--bg-main)';
            textarea.style.color = 'var(--text-main)';
            textarea.style.fontSize = '0.9rem';
            textarea.style.marginTop = '0.5rem';
            
            quizCard.appendChild(textarea);
        }

        // 4. 숨겨진 정답 및 해설 박스 배치 (10. grading.js 작동 시 hidden 해제)
        const explainBox = document.createElement('div');
        explainBox.id = `explain-${idx}`;
        explainBox.className = 'hidden quiz-explain-box';
        explainBox.style.marginTop = '1rem';
        explainBox.style.padding = '0.75rem';
        explainBox.style.backgroundColor = 'rgba(79, 70, 229, 0.08)';
        explainBox.style.borderRadius = '6px';
        explainBox.style.fontSize = '0.85rem';
        explainBox.style.borderLeft = '3px solid var(--accent)';

        // 정답 인덱스 가독성 변환 (0 -> 1번 보기)
        const displayAnswer = (q.type === 'essay') ? q.a : `정답: ${parseInt(q.a) + 1}번`;

        explainBox.innerHTML = `
            <p style="color: var(--primary); font-weight: bold; margin-bottom: 0.25rem;">
                <i class="fa-solid fa-circle-info"></i> ${displayAnswer}
            </p>
            <p style="color: var(--text-main); opacity: 0.9;"><strong>출제 해설:</strong> ${q.e}</p>
        `;
        
        quizCard.appendChild(explainBox);
        container.appendChild(quizCard);
    });
}
