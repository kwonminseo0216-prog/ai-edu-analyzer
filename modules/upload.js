import { performOCR } from './ocr.js';

/**
 * 9. 파일 드래그 앤 드롭 및 파일 업로드 시스템 초기화
 * app.js의 구동 단계에서 호출되어 브라우저 리스너를 활성화합니다.
 */
export function initFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-upload');

    if (!dropZone || !fileInput) return;

    // 클릭 시 파일 선택 창이 활성화되도록 연동
    dropZone.addEventListener('click', () => fileInput.click());

    // 파일 창에서 파일이 수동 선택되었을 때의 이벤트 처리
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processIncomingFile(e.target.files[0]);
        }
    });

    // 9-1. 드래그 오버(Drag Over)시 테두리 강조 UI 피드백 설정
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.borderColor = 'var(--primary)';
            dropZone.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
        }, false);
    });

    // 9-2. 드래그가 영역을 벗어나거나 끝났을 때 테두리 복구
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.borderColor = 'var(--border-color)';
            dropZone.style.backgroundColor = 'transparent';
        }, false);
    });

    // 9-3. 파일 드롭(Drop) 발생 시 핵심 가공 파이프라인 연결
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            processIncomingFile(files[0]);
        }
    });
}

/**
 * 9-4. 들어온 파일의 확장자 유형(MIME Type)별 분기 처리기
 * @param {File} file - 유저가 드롭하거나 선택한 단일 파일 객체
 */
function processIncomingFile(file) {
    const textInput = document.getElementById('input-text-1');
    
    // A. 텍스트 파일 (.txt) 처리 파트
    if (file.type === "text/plain" || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        
        // 로딩 바인딩 안내
        textInput.value = "텍스트 파일을 읽어오는 중입니다...";
        
        reader.onload = (event) => {
            textInput.value = event.target.result;
        };
        
        reader.onerror = () => {
            alert("파일을 읽는 도중 오류가 발생했습니다.");
            textInput.value = "";
        };
        
        reader.readAsText(file, 'UTF-8'); // 한국어 인코딩 깨짐 방지
    } 
    // B. 이미지 파일 (.png, .jpg, .jpeg) 처리 파트
    else if (file.type.startsWith('image/')) {
        // 12번 ocr.js 모듈 엔진으로 이미지 전송 권한 이양
        performOCR(file);
    } 
    // C. 지원하지 않는 포맷 예외 처리
    else {
        alert("지원하지 않는 파일 형식입니다.\n순수 텍스트 파일(.txt) 또는 이미지 파일만 업로드 가능합니다.");
    }
}
