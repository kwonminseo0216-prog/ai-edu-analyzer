/**
 * 17. 분석 지문 히스토리 내역 저장 및 실시간 불러오기(복원) 관리 모듈
 */

const HISTORY_STORAGE_KEY = 'edu_analyzer_history_list';

/**
 * 새로운 분석 이력을 저장소에 추가하고 리스트를 갱신합니다.
 * @param {string} titleSnippet - 본문 앞부분 일부를 잘라 만든 타이틀 요약문
 */
export function saveToHistory(titleSnippet) {
    try {
        const text1 = document.getElementById('input-text-1').value.trim();
        const text2 = document.getElementById('input-text-2').value.trim();
        const grade = document.getElementById('grade-select').value;
        const isCompareMode = !document.getElementById('input-text-2').classList.contains('hidden');

        if (!text1) return;

        // 1. 기존 히스토리 리스트 불러오기
        let historyList = loadHistoryListFromStorage();

        // 중복 저장 방지 (동일한 본문이 이미 있으면 지우고 최상단에 재배치하기 위함)
        historyList = historyList.filter(item => item.text1 !== text1);

        // 2. 새 히스토리 객체 생성 (현재 날짜/시간 스탬프 포함)
        const newHistoryItem = {
            id: Date.now(),
            title: titleSnippet,
            text1: text1,
            text2: isCompareMode ? text2 : "",
            grade: grade,
            isCompareMode: isCompareMode,
            date: getNowTimeString()
        };

        // 3. 배열 최상단(앞쪽)에 추가하고 최대 10개까지만 유지
        historyList.unshift(newHistoryItem);
        if (historyList.length > 10) {
            historyList.pop();
        }

        // 4. 로컬스토리지 저장 및 UI 리렌더링
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyList));
        renderHistoryUI();

    } catch (error) {
        console.error("[History Save Error] 이력 저장 실패:", error);
    }
}

/**
 * 17-1. 로컬스토리지에 저장된 기록들을 꺼내와 왼쪽 패널 UI에 동적 주입
 */
export function renderHistoryUI() {
    const container = document.getElementById('history-list');
    if (!container) return;

    container.innerHTML = '';
    const historyList = loadHistoryListFromStorage();

    if (historyList.length === 0) {
        container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem;">이전 분석 기록이 없습니다.</p>`;
        return;
    }

    // 5. 저장된 기록들을 기반으로 히스토리 아이템 엘리먼트 생성
    historyList.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        
        // 인라인 스타일 부여 (기본 호버 및 간격 디자인)
        itemDiv.style.padding = '0.5rem 0.75rem';
        itemDiv.style.borderBottom = '1px solid var(--border-color)';
        itemDiv.style.cursor = 'pointer';
        itemDiv.style.fontSize = '0.8rem';
        itemDiv.style.transition = 'background-color 0.2s';
        
        itemDiv.innerHTML = `
            <div style="font-weight:600; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                <i class="fa-solid fa-file-lines" style="color:var(--primary); margin-right:4px;"></i> ${item.title}
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-top:2px;">
                <span>Grade: ${item.grade.toUpperCase()}</span>
                <span>${item.date}</span>
            </div>
        `;

        // 6. 히스토리 아이템 클릭 시 본문 입력창에 과거 데이터 완벽 복원 이양
        itemDiv.addEventListener('click', () => {
            if (confirm("이전 분석 지문 데이터를 입력창에 복원하시겠습니까? (현재 작성 중인 내용은 덮어씌워집니다.)")) {
                document.getElementById('input-text-1').value = item.text1;
                document.getElementById('grade-select').value = item.grade;
                
                const text2Input = document.getElementById('input-text-2');
                const compareBtn = document.getElementById('compare-mode-btn');
                
                if (item.isCompareMode) {
                    text2Input.value = item.text2;
                    text2Input.classList.remove('hidden');
                    compareBtn.innerText = "단일 모드";
                } else {
                    text2Input.value = "";
                    text2Input.classList.add('hidden');
                    compareBtn.innerText = "비교 모드";
                }
                
                // 학년 변경 동기화를 위해 스토리지 강제 갱신 트리거
                localStorage.setItem('edu_analyzer_grade', item.grade);
                alert("지문 복원이 완료되었습니다. 'AI 심층 분석 시작' 버튼을 누르면 다시 분석할 수 있습니다.");
            }
        });

        // 마우스 호버 효과 부여
        itemDiv.addEventListener('mouseenter', () => itemDiv.style.backgroundColor = 'rgba(79, 70, 229, 0.05)');
        itemDiv.addEventListener('mouseleave', () => itemDiv.style.backgroundColor = 'transparent');

        container.appendChild(itemDiv);
    });
}

/**
 * 내장 헬퍼: 안전한 내부 스토리지 파싱
 */
function loadHistoryListFromStorage() {
    try {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

/**
 * 내장 헬퍼: 현재 시각 포맷팅 ([06-18 13:19])
 */
function getNowTimeString() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}-${dd} ${hh}:${min}`;
}

// 최초 모듈 로드 시 히스토리 UI 자동 그리기 구동
renderHistoryUI();
