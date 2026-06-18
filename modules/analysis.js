import { AppState } from '../app.js';
import { renderSummary } from './summary.js';
import { renderQuestions } from './question.js';
import { renderVocab } from './vocab.js';
import { renderChart } from './graph.js';
import { renderWordCloud } from './wordcloud.js';
import { renderMermaidDiagram } from './mermaid.js';

export async function handleAnalysisPipeline() {
    const textInput = document.getElementById('passage-input')?.value.trim();
    if (!textInput) {
        alert("📌 분석할 지문을 입력해 주세요!");
        return;
    }

    // 로딩 애니메이션 켜기
    const analyzerBtn = document.getElementById('analyze-btn');
    if (analyzerBtn) analyzerBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 분석 중...`;

    // 1초 뒤에 가짜 AI 분석 결과 데이터 생성 (API Key 불필요)
    setTimeout(() => {
        const mockResult = generateMockAnalysisData(textInput);
        
        // 전역 상태에 저장
        AppState.currentData = mockResult;

        // 각 화면 영역에 데이터 뿌려주기
        renderSummary(mockResult.summary);
        renderQuestions(mockResult.questions);
        renderVocab(mockResult.vocabulary);
        renderChart(mockResult.keywords);
        renderWordCloud(mockResult.keywords);
        renderMermaidDiagram(mockResult.structure);

        // 로딩 완료 후 버튼 원상복구
        if (analyzerBtn) analyzerBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> AI 심층 분석 시작`;
        console.log("🎯 지문 분석 완료 (로컬 모드)");
    }, 1000);
}

// 테스트용 고품질 교육학 결과 데이터 생성기
function generateMockAnalysisData(text) {
    return {
        summary: {
            title: "고등 교육학 지문 핵심 요약 리포트",
            overview: `입력된 지문은 교육의 내재적 목적과 외재적 가치 사이의 갈등과 조화를 다루고 있습니다. 지문 내에서 "${text.substring(0, 15)}..." 부분은 현대 교육 제도의 모순을 짚어내는 핵심 단서입니다.`,
            points: [
                "교육의 본질적 가치: 인간의 지적·도덕적 성장을 목적으로 함 (내재적 가치).",
                "교육의 도구적 가치: 직업 준비 및 사회적 상승 이동의 수단으로 활용됨 (외재적 가치).",
                "해결 방안: 두 가치가 대립 관계가 아닌 상호 보완적 관계로 발전해야 함을 강조함."
            ]
        },
        questions: [
            {
                id: 1,
                type: "multiple",
                question: "윗글의 내용과 일치하지 않는 것은 무엇입니까?",
                options: ["교육은 내재적 가치만을 지녀야 한다.", "외재적 가치는 직업 준비와 관련이 깊다.", "현대 교육은 두 가치의 조화를 필요로 한다.", "지적 성장은 본질적 목적에 해당한다."],
                answer: 1,
                explanation: "지문에서는 내재적 가치와 외재적 가치의 조화를 강조하고 있으므로 '내재적 가치만을 지녀야 한다'는 설명은 일치하지 않습니다."
            },
            {
                id: 2,
                type: "subjective",
                question: "지문에서 강조하는 교육의 '도구적 가치'가 의미하는 바를 단어로 서술하시오.",
                answer: "외재적 가치",
                explanation: "사회적 성공이나 취업 등 외부적 목적을 위해 교육을 수단으로 삼는 것은 외재적(도구적) 가치입니다."
            }
        ],
        vocabulary: [
            { word: "내재적 (Intrinsic)", meaning: "사물이나 현상 내부에 본질적으로 속해 있는 것" },
            { word: "외재적 (Extrinsic)", meaning: "외부의 다른 목적을 위한 수단이나 도구가 되는 것" },
            { word: "상호보완 (Complementary)", meaning: "서로 부족한 부분을 채워주어 완전하게 함" }
        ],
        keywords: [
            { text: "교육", value: 12 },
            { text: "가치", value: 9 },
            { text: "내재적", value: 6 },
            { text: "외재적", value: 5 },
            { text: "목적", value: 4 }
        ],
        structure: "graph TD\nA[교육의 목적] --> B(내재적 가치: 지적 성장)\nA --> C(외재적 가치: 사회적 수단)\nB --> D{조화와 균형 필요}\nC --> D"
    };
}
