import { loadKey } from './storage.js';

/**
 * 22. AI 선생님 1:1 질의응답(Q&A) 시스템 초기화
 * 챗 인터페이스의 메시지 전송 및 UI 렌더링을 통제합니다.
 */
export function initAiTeacher() {
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');

    if (!sendBtn || !chatInput) return;

    // 전역 윈도우 객체에 스크롤 함수 노출 (새 메시지 수신 시 하단 이동용)
    window.scrollChatToBottom = () => {
        const box = document.getElementById('chat-box');
        if (box) box.scrollTop = box.scrollHeight;
    };

    // 전송 버튼 클릭 시 질의응답 파이프라인 가동
    sendBtn.addEventListener('click', handleUserQuery);

    // 입력창에서 엔터 키를 누르면 자동 전송되도록 편의 기능 바인딩
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserQuery();
        }
    });
}

/**
 * 22-1. 유저 질문 추출 및 UI 렌더링 통제 핵심 핸들러
 */
async function handleUserQuery() {
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const query = chatInput.value.trim();

    if (!query) return;

    // 1. API 키 및 현재 로드된 지문 텍스트 원문 확보
    const apiKey = loadKey();
    const currentText = document.getElementById('input-text-1').value.trim();

    if (!apiKey) {
        alert("OpenAI API Key가 설정되지 않았습니다. 상단에서 먼저 입력해주세요.");
        return;
    }

    // 2. 유저 질문을 챗 윈도우 우측에 말풍선으로 즉시 렌더링
    appendMessage('user', query);
    chatInput.value = ''; // 입력창 초기화
    window.scrollChatToBottom();

    // 3. AI 선생님의 '생각 중...' 실시간 로딩 말풍선 임시 생성
    const loadingId = appendMessage('teacher', `<i class="fa-solid fa-spinner fa-spin"></i> 질문을 분석하여 맞춤형 해설을 작성하고 있습니다...`);
    window.scrollChatToBottom();

    try {
        // 4. OpenAI API 통신 (Stream 미사용, 단일 완료형 호출)
        const reply = await fetchTeacherReply(apiKey, currentText, query);
        
        // 5. 로딩 말풍선을 제거하고 실제 AI 선생님의 정밀 답변으로 교체
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            loadingDiv.innerHTML = `<p style="margin:0; font-weight:600; color:var(--primary); margin-bottom:4px;"><i class="fa-solid fa-graduation-cap"></i> AI 국어/영어 선생님</p>
                                    <div style="line-height:1.6; font-size:0.85rem; white-space:pre-wrap;">${reply}</div>`;
        }
        window.scrollChatToBottom();

    } catch (error) {
        console.error("[AI Teacher Error] 대화 처리 실패:", error);
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            loadingDiv.innerHTML = `<p style="color:var(--danger); margin:0;"><i class="fa-solid fa-exclamation-circle"></i> 답변을 불러오지 못했습니다. API 상태를 확인하세요.</p>`;
        }
    }
}

/**
 * 22-2. OpenAI Chat API 연동 및 맞춤형 페르소나 주입
 */
async function fetchTeacherReply(apiKey, textContext, userQuery) {
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
                    content: `당신은 학생들이 지문을 완벽하게 이해하도록 돕는 친절하고 명쾌한 스타 강사 'AI 선생님'입니다.
                    다음 제공되는 [학생이 공부 중인 지문 원문]을 완벽하게 인지한 상태에서, [학생의 질문]에 대해 고등학생 눈높이에 맞춰 두괄식으로 친절하게 답변해 주세요.
                    
                    [학생이 공부 중인 지문 원문]:
                    ${textContext || "아직 지문이 입력되지 않은 상태입니다."}
                    
                    답변 작성 지침:
                    1. 지나치게 딱딱한 어조는 피하고 구어체(~요, ~습니다)를 활용하세요.
                    2. 어휘 질문이라면 유의어/반의어를 함께 짚어주고, 문장 구조 질문이라면 끊어 읽기 분석을 제공하세요.
                    3. 중요한 개념 단어는 따옴표나 강조 기호를 사용해 가독성을 높이세요.`
                },
                { role: "user", content: userQuery }
            ],
            temperature: 0.5
        })
    });

    if (!response.ok) throw new Error("API Response Error");
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

/**
 * 내부 헬퍼: 말풍선 엘리먼트 생성 및 동적 추가 함수
 */
function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const wrapper = document.createElement('div');
    wrapper.id = msgId;
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.marginBottom = '0.75rem';
    
    if (sender === 'user') {
        wrapper.style.alignItems = 'flex-end';
        wrapper.innerHTML = `
            <div style="background-color:var(--primary); color:#ffffff; padding:0.5rem 0.75rem; border-radius:12px 12px 0 12px; max-width:85%; font-size:0.85rem; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                ${text}
            </div>
        `;
    } else {
        wrapper.style.alignItems = 'flex-start';
        wrapper.innerHTML = `
            <p style="margin:0; font-weight:600; color:var(--primary); margin-bottom:4px; font-size:0.8rem;"><i class="fa-solid fa-graduation-cap"></i> AI 국어/영어 선생님</p>
            <div style="background-color:var(--bg-main); border:1px solid var(--border-color); color:var(--text-main); padding:0.5rem 0.75rem; border-radius:12px 12px 12px 0; max-width:85%; font-size:0.85rem;">
                ${text}
            </div>
        `;
    }
    
    chatBox.appendChild(wrapper);
    return msgId;
}

// 최초 로드 시 즉시 가동 준비
initAiTeacher();
