/**
 * 14. AI 추출 중요 문장 형광펜 시각화 및 인터랙티브 인터페이스 제어 모듈
 * @param {string} highlightedHtml - AI가 중요 문장에 <mark> 태그를 주입하여 완성한 HTML 문자열
 */
export function renderAdvancedHighlight(highlightedHtml) {
    const targetArea = document.getElementById('highlighted-original');
    if (!targetArea) return;

    // 1. 결과창에 형광펜 처리된 본문 HTML 주입
    targetArea.innerHTML = highlightedHtml;

    // 2. 주입된 본문 내의 모든 <mark> (형광펜) 태그 요소들 캐싱
    const marks = targetArea.querySelectorAll('mark');

    if (marks.length === 0) {
        console.warn("[Highlight Warning] 본문 내에 생성된 하이라이트 문장이 없습니다.");
        return;
    }

    // 3. 개별 하이라이트 문장마다 순회하며 인덱스 부여 및 메커니즘 연동
    marks.forEach((mark, index) => {
        // 고유 식별자 ID 부여
        mark.id = `sentence-highlight-${index}`;
        
        // 중요도별 시각적 디자인 고도화를 위한 데이터 속성 및 스타일 적용
        mark.setAttribute('data-index', index);
        mark.title = "클릭 시 이 문장에 초점을 맞추고 집중 학습을 유도합니다.";
        
        // 4. 마우스 클릭 시 트리거되는 인터랙티브 효과 바인딩
        mark.addEventListener('click', () => {
            // 화면 중앙으로 부드럽게 스크롤 이동
            mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // 기존에 들어가 있을 수 있는 애니메이션 클래스 초기화 후 재주입
            mark.style.outline = '3px solid var(--primary)';
            mark.style.boxShadow = '0 0 12px var(--primary)';
            mark.style.borderRadius = '4px';
            
            // 2초 뒤 강조 외곽선과 섀도 효과를 자연스럽게 삭제하는 타이머 세팅
            setTimeout(() => {
                mark.style.outline = 'none';
                mark.style.boxShadow = 'none';
            }, 2000);

            // [22번 aiTeacher.js 확장 연동용 훅] 
            // 클릭한 문장의 텍스트를 AI 선생님 Q&A 창에 자동으로 주입해주는 편의 기능 제공
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.value = `"${mark.innerText}" 이 문장이 왜 시험 출제 포인트인지 상세히 설명해 주세요!`;
                chatInput.focus();
            }
        });
    });
}
