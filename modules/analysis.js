// ==========================================================================
// [Module Imports] 후속 시각화 및 문제 출제 바인딩 함수 연동
// ==========================================================================
import { renderAdvancedHighlight } from './highlight.js';
import { renderChart } from './graph.js';
import { renderWordCloud } from './wordcloud.js';
import { renderQuiz } from './question.js';
import { saveToHistory } from './history.js';
import { updateStatistics } from './statistics.js';

/**
 * 메인 오케스트레이션 파이프라인
 * app.js에서 호출되어 API 통신 및 데이터 렌더링을 지휘합니다.
 */
export async function runAnalysisPipeline({ apiKey, text1, text2, grade, isCompareMode }) {
    // 1. 국어 / 영어 자동 판별
    const isEnglish = detectLanguage(text1);
    updateLanguageBadge(isEnglish, grade);

    // 2. OpenAI API 요청용 프롬프트 빌드
    const prompt = buildPrompt(text1, text2, grade, isEnglish, isCompareMode);

    // 3. API Fetch 수행
    const responseData = await fetchAIAnalysis(apiKey, prompt);

    // 4. 받아온 정밀 JSON 데이터를 각 화면 컴포넌트에 분배 바인딩
    bindDataToUI(responseData, isCompareMode);

    // 5. 사이드 기능 연동 (기록 저장 및 누적 학습량 계산)
    saveToHistory(text1.substring(0, 15) + "...");
    updateStatistics();

    return responseData;
}

/**
 * 4-1. 정규식을 활용한 국어·영어 자동 판별 엔진
 */
function detectLanguage(text) {
    const englishPattern = /[a-zA-Z]/g;
    const matches = text.match(englishPattern);
    const englishCount = matches ? matches.length : 0;
    // 알파벳 비중이 상위 100자 중 15개 이상이면 영어 지문으로 판별
    return englishCount > 15;
}

function updateLanguageBadge(isEnglish, grade) {
    const badge = document.getElementById('lang-badge');
    const gradeMap = { high1: "고1", high2: "고2", high3: "고3/수능", middle: "중등" };
    badge.innerText = `${gradeMap[grade] || "일반"} | ${isEnglish ? "영어 지문" : "국어 지문"}`;
}

/**
 * 4-2. 출제위원급 AI 프롬프트 가반 구조 설계
 */
function buildPrompt(text1, text2, grade, isEnglish, isCompareMode) {
    return `
    당신은 대한민국 최고 권위의 대입 수능 국어/영어 출제위원이자 교육학 AI 전문가입니다.
    다음 제공된 지문을 타겟 학년(${grade})의 난이도에 맞추어 철저히 정밀 분석한 후, 오직 제시된 **JSON 포맷** 양식으로만 변환하여 반환하세요. 앞뒤 마크다운 문장이나 설명은 절대 금지합니다.

    [기본 분석 지문 원문]:
    ${text1}

    ${isCompareMode ? `[비교 분석 지문 원문]:\n${text2}` : ''}

    [반드시 준수할 JSON 반환 포맷 구조]:
    {
        "summary": "전체 지문 내용의 요약문 및 명확한 주제 의식 정리",
        "points": "시험 출제 핵심 매커니즘, 매력적인 오답 함정 포인트 요소 기술",
        "highlightedText": "본문 내용 중 출제 확률이 매우 높은 핵심 문장에만 정밀하게 <mark>태그를 씌운 전체 HTML 코드 문자열",
        "keywords": [
            { "word": "핵심어1", "count": 7, "importance": "high", "desc": "이 지문 내에서의 개념적 의미 설명" },
            { "word": "핵심어2", "count": 4, "importance": "medium", "desc": "부차적 논리 관계 설명" }
        ],
        "mermaidFlow": "graph TD\\n  A[원인 변인] --> B[과정 매커니즘]\\n  B --> C[최종 결과 구조]",
        "quiz": [
            { "type": "choice", "q": "1. 위 글의 내용과 일치하지 않는 것은?", "o": ["보기1", "보기2", "보기3", "보기4", "보기5"], "a": 2, "e": "본문 3문단 인과관계 불일치 해설" },
            { "type": "ox", "q": "2. 본문의 주장에 따르면 원인 요소는 결과를 항상 억제한다. (O/X)", "o": ["O", "X"], "a": 1, "e": "오히려 촉진한다고 기술됨" },
            { "type": "blank", "q": "3. 문맥상 빈칸 (A)에 들어갈 단어로 가장 적절한 것은?", "o": ["대조적", "순응적"], "a": 0, "e": "역접의 접속사 뒤 논리적 추론" },
            { "type": "essay", "q": "4. [서술형 조건 지정] 필자가 강조한 상반된 두 개념의 차이점을 조건에 맞게 서술하시오.", "o": [], "a": "정답 키워드 매칭 기준", "e": "핵심 키워드 포함 여부 판별 조건 가이드" }
        ],
        "compareAnalysis": "${isCompareMode ? '두 지문의 공통점, 차이점, 핵심 논리 대조 표 및 텍스트 요약 기술' : '단일 분석'}"
    }
    `;
}

/**
 * 4-3. OpenAI API 통신 및 JSON 파싱 가동
 */
async function fetchAIAnalysis(apiKey, prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.2
        })
    });

    if (!response.ok) {
        throw new Error(`API 요청 실패 (코드: ${response.status})`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

/**
 * 4-4. UI 컴포넌트별 데이터 분배 바인딩 데이터 분배
 */
function bindDataToUI(data, isCompareMode) {
    document.getElementById('summary-text').innerText = data.summary;
    document.getElementById('points-text').innerText = data.points;

    // 14. 형광펜 강조 데이터 이양
    renderAdvancedHighlight(data.highlightedText);

    // 18. 지문 비교창 활성화 여부 핸들링
    const compareBox = document.getElementById('compare-result-box');
    if (isCompareMode) {
        compareBox.classList.remove('hidden');
        document.getElementById('compare-text-area').innerText = data.compareAnalysis;
    } else {
        compareBox.classList.add('hidden');
    }

    // 11, 16. 시각화 대시보드 데이터 주입
    renderChart(data.keywords);
    renderWordCloud(data.keywords);

    // 15. Mermaid 플로우차트 탑재
    const mermaidArea = document.getElementById('mermaid-area');
    mermaidArea.innerHTML = `<pre class="mermaid">${data.mermaidFlow}</pre>`;
    if (window.mermaid) {
        window.mermaid.run();
    }

    // 6. 퀴즈 생성 영역 데이터 이양
    renderQuiz(data.quiz);
}
