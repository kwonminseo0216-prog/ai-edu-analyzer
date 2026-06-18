/**
 * 12. Tesseract.js 라이브러리를 활용한 온브라우저 OCR 구동 모듈
 * 이미지 파일 바이너리를 받아 텍스트 데이터를 추출한 뒤 입력창에 주입합니다.
 */
export async function performOCR(imageFile) {
    const textInput1 = document.getElementById('input-text-1');
    const badge = document.getElementById('lang-badge');

    if (!textInput1) return;

    // 1. OCR 엔진 분석 시작 상태 UI 피드백 제공
    textInput1.value = "⏳ 이미지 내 텍스트 스캔 및 글자 추출을 진행하고 있습니다.\n최초 구동 시 언어 팩 로드로 인해 약 3~5초가 소요될 수 있습니다. 잠시만 기다려주세요...";
    badge.innerText = "OCR 분석 중...";

    try {
        // 2. Tesseract 워커 생성 및 한국어(kor), 영어(eng) 멀티 언어 팩 로드
        // 외부 글로벌 Tesseract 객체 사용
        if (typeof Tesseract === 'undefined') {
            throw new Error("Tesseract.js 라이브러리가 로드되지 않았습니다. 인터넷 연결을 확인하세요.");
        }

        const worker = await Tesseract.createWorker(['kor', 'eng']);
        
        // 3. 이미지 해독 수행
        const result = await worker.recognize(imageFile);
        
        // 4. 워커 리소스 해제 (메모리 누수 방지)
        await worker.terminate();

        // 5. 추출된 결과 텍스트 정제 및 입력창 최종 주입
        const extractedText = result.data.text.trim();

        if (!extractedText) {
            throw new Error("이미지에서 텍스트를 감지하지 못했습니다. 글자가 선명한지 확인해주세요.");
        }

        textInput1.value = extractedText;
        
        // 6. 언어 감지 및 배지 상태 업데이트 유도 트리거 (analysis.js와 동일 규격 적용)
        const englishPattern = /[a-zA-Z]/g;
        const matches = extractedText.match(englishPattern);
        const isEnglish = matches && matches.length > 15;
        
        badge.innerText = `OCR 완료 | ${isEnglish ? "영어 탐지" : "국어 탐지"}`;
        
        // 입력창에 포커스를 주어 유저가 바로 편집할 수 있도록 편의성 제공
        textInput1.focus();

    } catch (error) {
        console.error("[OCR Engine Error] 스캔 실패:", error);
        alert(`❌ 이미지 인식 오류:\n${error.message}`);
        textInput1.value = "";
        badge.innerText = "분석 실패";
    }
}
