/**
 * 13. HTML5 표준 Web Speech API 기반 TTS(텍스트 음성 변환) 제어 모듈
 */

// 브라우저 글로벌 음성 합성 컨트롤러 참조
const synth = window.speechSynthesis;
let ttsUtterance = null;

/**
 * TTS 시스템 초기화 및 버튼 이벤트 리스너 바인딩
 */
export function initTTS() {
    const playBtn = document.getElementById('tts-play-btn');
    const stopBtn = document.getElementById('tts-stop-btn');

    if (!playBtn || !stopBtn) return;

    // 읽기 버튼 클릭 시 본문 텍스트를 추출하여 재생 파이프라인 가동
    playBtn.addEventListener('click', () => {
        // 이미 낭독 중인 경우 중복 실행 방지 및 일시정지 해제
        if (synth.speaking) {
            if (synth.paused) {
                synth.resume();
            }
            return;
        }

        // 형광펜 영역(14번 모듈 결과물)에서 순수 텍스트만 추출
        const targetElement = document.getElementById('highlighted-original');
        const textToRead = targetElement ? targetElement.innerText.trim() : "";

        if (!textToRead || textToRead.startsWith("지문을 입력하고")) {
            alert("음성으로 읽어줄 지문 데이터가 없습니다. 먼저 분석을 진행해주세요.");
            return;
        }

        // 낭독 가동
        speakText(textToRead);
    });

    // 정지 버튼 클릭 시 오디오 큐 전체 초기화
    stopBtn.addEventListener('click', () => {
        if (synth.speaking) {
            synth.cancel();
        }
    });
}

/**
 * 13-1. 언어 자동 매핑 및 음성 합성 출력 핵심 로직
 * @param {string} text - 오디오로 변환할 순수 문자열 본문
 */
function speakText(text) {
    try {
        // 1. 기존 오디오 대기열이 있다면 초기화 후 시작
        synth.cancel();

        // 2. 발화 인스턴스 생성
        ttsUtterance = new SpeechSynthesisUtterance(text);

        // 3. 국어/영어 언어 패턴 자동 감정 분석 (알파벳 포함 여부 기준)
        const isEnglish = /[a-zA-Z]/.test(text.substring(0, 100));
        
        if (isEnglish) {
            ttsUtterance.lang = 'en-US'; // 미국 영어 발음 지정
            ttsUtterance.rate = 0.95;    // 학습용 최적 듣기 속도 조절 (살짝 느리게)
        } else {
            ttsUtterance.lang = 'ko-KR'; // 한국어 표준 성우 발음 지정
            ttsUtterance.rate = 1.0;     // 보통 속도
        }

        ttsUtterance.pitch = 1.0; // 보통 피치(톤) 설정

        // 4. 시스템 사운드 제어권 브라우저로 이양하여 출력 시작
        synth.speak(ttsUtterance);

        // [부가 기능] 낭독 시작/종료 시 버튼 스타일 변화 피드백 처리
        const playBtn = document.getElementById('tts-play-btn');
        ttsUtterance.onstart = () => {
            playBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 재생중`;
            playBtn.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
        };

        ttsUtterance.onend = () => {
            playBtn.innerHTML = `<i class="fa-solid fa-play"></i> 읽기`;
            playBtn.style.backgroundColor = 'transparent';
        };

        ttsUtterance.onerror = (e) => {
            console.error("TTS 재생 오류:", e);
            synth.cancel();
        };

    } catch (error) {
        console.error("[TTS Engine Error] 낭독 가동 실패:", error);
    }
}

// 수동 즉시 바인딩 실행 환경 처리
initTTS();
