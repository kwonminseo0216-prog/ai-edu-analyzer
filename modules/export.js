import { AppState } from './app.js';

/**
 * 7. 결과 데이터 파일 내보내기 및 다운로드 시스템
 * @param {string} type - 파일 확장자 형태 ('txt' | 'md')
 */
export function exportResultData(type) {
    // 1. 현재 분석 완료된 데이터 세트가 있는지 유효성 검증
    if (!AppState.currentData) {
        alert("다운로드할 분석 결과 데이터가 존재하지 않습니다. 먼저 지문 분석을 진행해주세요.");
        return;
    }

    const data = AppState.currentData;
    let fileName = `AI_EduAnalyzer_Report_${getFormattedDate()}`;
    let fileContent = "";

    // 2. 요청 유형별 텍스트 포맷 매핑 구조화
    if (type === 'txt') {
        fileName += ".txt";
        fileContent = buildTextFormat(data);
    } else if (type === 'md') {
        fileName += ".md";
        fileContent = buildMarkdownFormat(data);
    }

    // 3. 브라우저 메모리 상에 가상 Blob 다운로드 링크 생성 및 트리거
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 메모리 누수 방지용 오브젝트 해제
    URL.revokeObjectURL(link.href);
}

/**
 * 7-1. 순수 텍스트(.txt) 리포트 템플릿 빌더
 */
function buildTextFormat(data) {
    let txt = `==================================================\n`;
    txt += `       AI 교육학 지문 분석 및 변형 문제 리포트       \n`;
    txt += `==================================================\n\n`;
    txt += `[1. 지문 요약 및 주제의식]\n${data.summary}\n\n`;
    txt += `[2. 출제 핵심 포인트 & 함정 요란]\n${data.points}\n\n`;
    
    if (data.compareAnalysis && data.compareAnalysis !== "단일 분석") {
        txt += `[3. 복수 지문 비교·대조 분석]\n${data.compareAnalysis}\n\n`;
    }

    txt += `[4. 핵심 키워드 가중치 분포]\n`;
    data.keywords.forEach(k => {
        txt += `- ${k.word} (빈도/중요도: ${k.count}회, 등급: ${k.importance}) : ${k.desc}\n`;
    });
    txt += `\n`;

    txt += `[5. 적중 예상 변형 문제지]\n`;
    data.quiz.forEach((q, idx) => {
        txt += `${idx + 1}. ${q.q}\n`;
        if (q.o && q.o.length > 0) {
            q.o.forEach((opt, oIdx) => {
                txt += `   (${oIdx + 1}) ${opt}\n`;
            });
        }
        txt += `   * 정답 가이드 및 해설: ${q.e}\n\n`;
    });

    return txt;
}

/**
 * 7-2. 마크다운(.md) 문서화 서식 빌더
 */
function buildMarkdownFormat(data) {
    let md = `# AI EduAnalyzer 종합 분석 보고서\n\n`;
    md += `> **생성일자:** ${getFormattedDate(true)}\n\n`;
    md += `---\n\n`;
    md += `## 📝 1. 지문 요약 및 주제\n${data.summary}\n\n`;
    md += `## 🎯 2. 출제 핵심 포인트\n${data.points}\n\n`;

    if (data.compareAnalysis && data.compareAnalysis !== "단일 분석") {
        md += `## 🔄 3. 지문 비교 대조 리포트\n${data.compareAnalysis}\n\n`;
    }

    md += `## 🔑 4. 핵심 어휘 세트\n`;
    md += `| 키워드 | 등장 빈도 | 중요도 등급 | 개념적 의미 및 문맥적 해석 |\n`;
    md += `| :--- | :---: | :---: | :--- |\n`;
    data.keywords.forEach(k => {
        md += `| **${k.word}** | ${k.count}회 | ${k.importance} | ${k.desc} |\n`;
    });
    md += `\n`;

    md += `## ✏️ 5. AI 적중 변형 문제\n`;
    data.quiz.forEach((q, idx) => {
        md += `### Q${idx + 1}. ${q.q}\n`;
        if (q.o && q.o.length > 0) {
            q.o.forEach((opt, oIdx) => {
                md += `${oIdx + 1}. ${opt}  \n`;
            });
        }
        md += `\n* **해설 및 정답 근거:** ${q.e}\n\n`;
    });

    return md;
}

/**
 * 날짜 포맷팅 유틸리티 헬퍼 함수
 */
function getFormattedDate(isSimple = false) {
    const d = new Date();
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    if (isSimple) return `${yy}-${mm}-${dd}`;
    
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yy}${mm}${dd}_${hh}${min}`;
}
