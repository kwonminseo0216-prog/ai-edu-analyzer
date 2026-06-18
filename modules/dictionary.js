// 대시보드 화면에 단 하나만 존재할 전역 툴팁 엘리먼트 참조 변수
let dictionaryTooltipElement = null;

/**
 * 23. 마우스 드래그 선택 기반 실시간 사전 시스템 초기화
 * API Key 없이 로컬에서 즉시 텍스트 감지 및 툴팁 피드백을 처리합니다.
 */
export function initDragDictionary() {
    // 1. 전역 툴팁 엘리먼트 동적 생성 및 body 주입
    createTooltipElement();

    // 2. 문서 전체에서 마우스 드래그를 끝내는 순간(mouseup)을 감지
    document.addEventListener('mouseup', handleTextSelection);

    // 3. 빈 공간을 클릭하면 열려 있던 사전 툴팁이 자연스럽게 닫히도록 바인딩
    document.addEventListener('mousedown', (e) => {
        if (dictionaryTooltipElement && !dictionaryTooltipElement.contains(e.target)) {
            hideDictionaryTooltip();
        }
    });
}

/**
 * 23-1. 브라우저 내 텍스트 선택 영역(Selection) 감지 및 실시간 팝업 핸들러
 */
function handleTextSelection(e) {
    // 현재 브라우저에서 드래그로 선택된 문자열 확보
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // 선택된 글자가 없거나, 너무 길면(문장 전체 드래그 등) 사전 조회 패스
    if (!selectedText || selectedText.length > 20) {
        return;
    }

    // 마우스 업 위치를 기반으로 툴팁이 나타날 절대 좌표(X, Y) 연산
    const posX = e.pageX;
    const posY = e.pageY - 40; // 마우스 커서보다 약간 위에 배치

    // API 통신 없이 즉시 가공된 로컬 안내 텍스트 주입
    const tooltipHtml = `
        <strong>🔍 ${selectedText}</strong>
        <br>
        <span style="font-size:0.8rem; line-height:1.4; display:block; margin-top:4px;">
            선택하신 [${selectedText}] 문맥상 주요 키워드입니다. 대시보드의 단어장과 워드클라우드를 함께 확인하며 독해 맥락을 파악해 보세요!
        </span>
    `;

    // 툴팁 레이어 화면에 노출
    showDictionaryTooltip(posX, posY, tooltipHtml);
}

/**
 * 내부 UI 헬퍼: 툴팁 레이어 DOM 동적 생성 및 초기 스타일 정의
 */
function createTooltipElement() {
    if (document.getElementById('dict-dynamic-tooltip')) return;

    dictionaryTooltipElement = document.createElement('div');
    dictionaryTooltipElement.id = 'dict-dynamic-tooltip';
    
    // 툴팁 기본 CSS 스타일 주입
    Object.assign(dictionaryTooltipElement.style, {
        position: 'absolute',
        backgroundColor: 'var(--bg-main, #ffffff)',
        color: 'var(--text-main, #0f172a)',
        border: '1px solid var(--border-color, #e2e8f0)',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontSize: '0.85rem',
        zIndex: '99999',
        display: 'none',
        pointerEvents: 'auto',
        maxWidth: '230px',
        wordBreak: 'break-word'
    });

    document.body.appendChild(dictionaryTooltipElement);
}

/**
 * 내부 UI 헬퍼: 지정한 위치에 툴팁 노출
 */
function showDictionaryTooltip(x, y, htmlContent) {
    if (!dictionaryTooltipElement) return;
    dictionaryTooltipElement.innerHTML = htmlContent;
    dictionaryTooltipElement.style.left = `${x}px`;
    dictionaryTooltipElement.style.top = `${y}px`;
    dictionaryTooltipElement.style.display = 'block';
}

/**
 * 내부 UI 헬퍼: 툴팁 숨김
 */
function hideDictionaryTooltip() {
    if (dictionaryTooltipElement) {
        dictionaryTooltipElement.style.display = 'none';
    }
}

// 모듈 로드 시 마우스 리스너 즉시 활성화
initDragDictionary();
