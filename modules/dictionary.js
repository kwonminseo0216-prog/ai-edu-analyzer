import { loadKey } from './storage.js';

// 대시보드 화면에 단 하나만 존재할 전역 툴팁 엘리먼트 참조 변수
let dictionaryTooltipElement = null;

/**
 * 23. 마우스 드래그 선택 기반 실시간 사전 시스템 초기화
 * 전역 마우스 업(Mouse Up) 이벤트를 감지하여 툴팁을 제어합니다.
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
 * 23-1. 브라우저 내 텍스트 선택 영역(Selection) 감지 및 위치 연산 핸들러
 */
async function handleTextSelection(e) {
    try {
        // 현재 브라우저에서 드래그로 선택된 문자열 확보
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        // 선택된 글자가 없거나, 너무 길면(문장 전체 드래그 등) 사전 조회 패스
        if (!selectedText || selectedText.length > 30) {
            return;
        }

        // 마우스 업 위치를 기반으로 툴팁이 나타날 절대 좌표(X, Y) 연산
        // e.pageY, e.pageX를 활용하여 스크롤 위치를 포함한 절대 좌표 계산
        const posX = e.pageX;
        const posY = e.pageY - 40; // 마우스 커서보다 약간 위에 배치

        // 사전 툴팁 우선 표시 (로딩 상태)
        showDictionaryTooltip(posX, posY, `<i class="fa-solid fa-spinner fa-spin"></i> "${selectedText}" 단어 검색 중...`);

        // OpenAI API Key 로드
        const apiKey = loadKey();
        if (!apiKey) {
            showDictionaryTooltip(posX, posY, "⚠️ 상단에 API Key를 등록하시면 실시간 사전 기능이 활성화됩니다.");
            return;
        }

        // 3. AI 사전 검색 실행
        const definition = await fetchWordDefinition(apiKey, selectedText);
        
        // 4. 검색된 결과를 툴팁 레이어에 최종 주입
        showDictionaryTooltip(posX, posY, `<strong>🔑 ${selectedText}</strong><br><span style="font-size:0.8rem; line-height:1.4;">${definition}</span>`);

    } catch (error) {
        console.error("[Dictionary Error] 단어 조회 실패:", error);
        hideDictionaryTooltip();
    }
}

/**
 * 23-2. OpenAI API를 활용한 문맥 맞춤형 간이 사전 조회
 */
async function fetchWordDefinition(apiKey, word) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: `당신은 초고속 학습용 사전 봇입니다. 입력된 단어(국어 또는 영어)의 핵심 뜻을 학생용 눈높이에 맞춰 최대 2문장 이내로 명확하게 요약해 주세요. 
                    영어 단어라면 품사(명, 동, 형 등)와 핵심 한국어 뜻을, 국어 단어라면 쉬운 한자어 풀이나 문맥적 의미를 제시하세요. 불필요한 서론이나 인사말은 절대 금지합니다.` 
                },
                { role: "user", content: `단어: "${word}"` }
            ],
            temperature: 0.3,
            max_tokens: 150
        })
    });

    if (!response.ok) throw new Error("API Network Error");
    const data = await response.json();
    return data.choices[0].message.content.trim();
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
        maxWidth: '250px',
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
