/**
 * 5. SVG 기반 및 Mermaid 다이어그램 동적 렌더링 모듈
 * 지문의 계층 구조 및 키워드 네트워크를 시각화합니다.
 */
export function renderMindmap(mermaidMarkup) {
    const container = document.getElementById('mermaid-area');
    
    // 1. 기존에 그려진 마인드맵 요소가 있다면 초기화
    container.innerHTML = '';

    // 2. 만약 AI가 생성한 마크업 데이터가 없거나 유효하지 않을 경우 예외 처리
    if (!mermaidMarkup || mermaidMarkup.trim() === "") {
        container.innerHTML = `<p class="error-text"><i class="fa-solid fa-exclamation-triangle"></i> 지문의 구조도 데이터를 불러오지 못했습니다.</p>`;
        return;
    }

    try {
        // 3. 뼈대 HTML 스크립트 주입
        const preElement = document.createElement('pre');
        preElement.className = 'mermaid';
        preElement.id = 'dynamic-mermaid-svg';
        preElement.textContent = mermaidMarkup;
        
        container.appendChild(preElement);

        // 4. 전역 mermaid 인스턴스가 로드되어 있다면 강제 재렌더링 구동 (15번 mermaid.js 연동)
        if (window.mermaid) {
            // 수동 검사 후 렌더링 파이프라인 트리거
            window.mermaid.run({
                nodes: [preElement]
            });
        }
    } catch (error) {
        console.error("[Mindmap Error] 다이어그램 생성 실패:", error);
        container.innerHTML = `<p class="error-text">구조도 시각화 엔진 스크립트 연산 오류</p>`;
    }
}

/**
 * [부가 기능] 키워드 간의 연관 관계를 직관적으로 파악할 수 있도록 
 * 단순 리스트 데이터를 인과 흐름 마크업으로 가공하는 헬퍼 함수
 */
export function generateFallbackFlow(keywords) {
    if (!keywords || keywords.length === 0) return "graph TD\\n  A[원문] --> B[내용 분석]";
    
    // 키워드가 존재할 때 상위 키워드에서 하위 키워드로 연결되는 흐름을 문자열로 반환
    let flow = "graph LR\\n";
    keywords.forEach((kw, idx) => {
        if (idx < keywords.length - 1) {
            flow += `  Node_${idx}[${kw.word}] --> Node_${idx+1}[${keywords[idx+1].word}]\\n`;
        }
    });
    return flow;
}
