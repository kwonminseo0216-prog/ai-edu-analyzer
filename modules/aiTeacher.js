/**
 * 22. 1:1 AI 스타강사 멘토 챗봇 시스템 초기화
 * API Key 없이도 작동하며, 사용자의 질문에 맞춰 피드백을 제공합니다.
 */
export function initAiTeacher() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatWindow = document.getElementById('chat-window');

    if (!sendBtn || !chatInput || !chatWindow) return;

    // 전송 버튼 클릭 이벤트 바인딩
    sendBtn.addEventListener('click', () => {
        processUserQuery(chatInput, chatWindow);
    });

    // 엔터키 입력 이벤트 바인딩
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processUserQuery(chatInput, chatWindow);
        }
    });
}

/**
 * 사용자가 입력한 질문을 처리하고 가짜 답변을 생성하는 핵심 핸들러
 */
function processUserQuery(chatInput, chatWindow) {
    const query = chatInput.value.trim();
    if (!query) return;

    // 1. 사용자가 입력한 메시지를 채팅창에 추가
    appendMessage('user', query);
    chatInput.value = ''; // 입력창 비우기

    // 2. 0.5초 뒤 AI 선생님의 자동 답변 출력 (API 통신 제거)
    setTimeout(() => {
        const teacherResponse = generateMockTeacherResponse(query);
        appendMessage('teacher', teacherResponse);
    }, 500);
}

/**
 * 교육학 스타강사 페르소나가 반영된 맞춤형 답변 생성기
 */
function generateMockTeacherResponse(query) {
    return `질문하신 "${query}"에 대해 답변드립니다! 해당 개념은 고등 교육학 및 수능/모의고사 독해에서 출제 빈도가 매우 높은 핵심 내용입니다. 지문 속 문맥을 통해 단어의 함축적 의미를 파악하는 것이 중요하니, 우측의 오답 노트와 키워드 그래프를 함께 비교하며 복습해 보세요!`;
}

/**
 * 채팅창에 메시지 말풍선을 동적으로 추가하는 UI 헬퍼 함수
 */
function appendMessage(sender, text) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;

    const messageRow = document.createElement('div');
    messageRow.style.display = 'flex';
    messageRow.style.justifyContent = sender === 'user' ? 'flex-end' : 'flex-start';
    messageRow.style.margin = '8px 0';

    const bubble = document.createElement('div');
    bubble.style.padding = '10px 14px';
    bubble.style.borderRadius = '12px';
    bubble.style.maxWidth = '75%';
    bubble.style.fontSize = '0.85rem';
    bubble.style.lineHeight = '1.4';

    if (sender === 'user') {
        bubble.style.backgroundColor = 'var(--theme-primary, #3b82f6)';
        bubble.style.color = '#ffffff';
        bubble.innerText = text;
    } else {
        bubble.style.backgroundColor = 'var(--bg-secondary, #f1f5f9)';
        bubble.style.color = 'var(--text-main, #0f172a)';
        bubble.style.border = '1px solid var(--border-color, #e2e8f0)';
        bubble.innerHTML = `<strong>👨‍🏫 AI 1:1 교육학 멘토</strong><br><br>${text}`;
    }

    messageRow.appendChild(bubble);
    chatWindow.appendChild(messageRow);
    
    // 새 메시지가 오면 자동으로 스크롤을 맨 아래로 내림
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 모듈 로드 시 즉시 챗봇 리스너 활성화
initAiTeacher();
