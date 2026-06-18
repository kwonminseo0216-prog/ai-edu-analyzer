/**
 * 16. 순수 자바스크립트 기반 가상 워드클라우드 빌더 및 인터랙티브 어휘 사전 팝업 모듈
 * @param {Array} keywords - analysis.js에서 파싱된 어휘 데이터 세트 [{word, count, importance, desc}]
 */
export function renderWordCloud(keywords) {
    const container = document.getElementById('wordcloud-container');
    if (!container) return;

    // 1. 기존 워드클라우드 컴포넌트 내부 초기화
    container.innerHTML = '';
    
    // 스타일 배치를 위한 컨테이너 기본 스타일 가반 정의
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.padding = '1rem';
    container.style.minHeight = '150px';
    container.style.gap = '8px';

    if (!keywords || keywords.length === 0) {
        container.innerHTML = `<p class="text-muted" style="font-size:0.85rem;">시각화할 어휘 데이터가 부족합니다.</p>`;
        return;
    }

    // 2. 단어들을 등장 빈도나 가중치에 상관없이 시각적 재미를 위해 무작위(Random Shuffling) 믹싱
    const shuffledKeywords = [...keywords].sort(() => Math.random() - 0.5);

    // 3. 믹싱된 단어들을 순회하며 HTML Span 노드로 동적 가공
    shuffledKeywords.forEach((k) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word-cloud-span';
        wordSpan.innerText = k.word;

        // 4. 등장 빈도(count) 수치에 따라 폰트 크기 차등 스케일링 연산 (최소 12px ~ 최대 28px)
        const computedFontSize = Math.min(Math.max(k.count * 3 + 10, 12), 28);
        wordSpan.style.fontSize = `${computedFontSize}px`;

        // 5. 중요도 등급(importance) 데이터에 따라 글자 굵기 및 텍스트 색상 차별화 변경
        if (k.importance === 'high') {
            wordSpan.style.fontWeight = '800';
            wordSpan.style.color = 'var(--primary)'; // 주제 직결 단어는 인디고 블루 고정
        } else if (k.importance === 'medium') {
            wordSpan.style.fontWeight = '600';
            wordSpan.style.color = 'var(--accent)';  // 중간 가중치는 에메랄드 그린
        } else {
            wordSpan.style.fontWeight = '400';
            wordSpan.style.color = 'var(--text-muted)';
        }

        // 6. 단어 클릭 시 상세 어휘 사전 팝업 알림 레이어 연동
        wordSpan.title = "클릭하시면 이 어휘의 문맥적 해설을 확인합니다.";
        wordSpan.addEventListener('click', () => {
            alert(`🔑 [핵심 어휘 단어장] — "${k.word}"\n\n• 지문 내 등장 빈도: ${k.count}회\n• 중요도 등급: ${k.importance.toUpperCase()}\n\n• 문맥적 상세 해설:\n${k.desc}`);
            
            // [22번 aiTeacher.js 심화 학습 연동용 편의 훅]
            // 단어를 클릭하면 하단 AI 선생님 질문 창에도 자동으로 세팅되도록 연동
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.value = `이 지문에서 "${k.word}"와(과) 연관되어 유의 깊게 봐두어야 할 유의어나 반의어 세트를 알려주세요!`;
                chatInput.focus();
            }
        });

        container.appendChild(wordSpan);
    });
}
