/**
 * 15. Mermaid.js 라이브러리 엔진 환경 설정 및 실시간 동적 렌더링 제어 모듈
 */

// 애플리케이션 시작 시 Mermaid 엔진의 기본 옵션을 초기화합니다.
export function initMermaidEngine() {
    if (typeof mermaid === 'undefined') {
        console.warn("[Mermaid Warning] Mermaid 라이브러리가 로드되지 않았습니다. 대시보드 구조도 기능이 제한될 수 있습니다.");
        return;
    }

    // 1. 현재 시스템의 다크모드 상태 확인
    const isDark = document.documentElement.classList.contains('dark');

    // 2. 대시보드 레이아웃 스타일에 맞게 Mermaid 기본 테마 구성 설정
    mermaid.initialize({
        startOnLoad: false,                     // 주입 시점에 수동으로 제어하기 위해 false 설정
        theme: isDark ? 'dark' : 'neutral',    // 다크모드 유무에 따라 스타일 자동 스위칭
        securityLevel: 'loose',                 // 마인드맵 내 내부 스타일 속성 허용
        flowchart: {
            useMaxWidth: true,                  // 부모 박스 크기에 맞춰 반응형 크기 조절
            htmlLabels: true,                   // 노드 내부 HTML 태그 지원 (가독성 향상)
            curve: 'basis'                      // 화살표 곡선 부드럽게 처리
        }
    });
}

/**
 * 15-1. 테마가 변경되었을 때 (다크모드 토글 시) 머메이드 엔진의 색상을 실시간으로 갱신하는 헬퍼 함수
 */
export function refreshMermaidTheme() {
    if (typeof mermaid === 'undefined') return;
    
    // 엔진 재초기화 실행
    initMermaidEngine();

    // 현재 화면에 이미 그려진 .mermaid 클래스를 가진 컨테이너가 있다면 재연산 실행
    const activeMermaid = document.getElementById('dynamic-mermaid-svg');
    if (activeMermaid && window.AppState?.currentData?.mermaidFlow) {
        activeMermaid.textContent = window.AppState.currentData.mermaidFlow;
        mermaid.run({
            nodes: [activeMermaid]
        });
    }
}

// 모듈이 처음 로드될 때 환경 설정을 즉시 적용합니다.
initMermaidEngine();
