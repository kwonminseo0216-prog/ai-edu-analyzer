/**
 * 11. Chart.js 연동 키워드 빈도 및 중요도 시각화 모듈
 */

// 차트 인스턴스를 저장할 변수 (재분석 시 기존 차트를 파괴하고 새로 그리기 위함)
let keywordChartInstance = null;

/**
 * 키워드 데이터를 바탕으로 막대 그래프를 렌더링합니다.
 * @param {Array} keywords - [{word: string, count: number, importance: string}, ...]
 */
export function renderChart(keywords) {
    const canvas = document.getElementById('keyword-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 1. 기존 차트가 있다면 파괴 (메모리 누수 및 중복 렌더링 방지)
    if (keywordChartInstance) {
        keywordChartInstance.destroy();
    }

    // 2. 데이터 가공 (빈도수 기준 내림차순 정렬)
    const sortedData = [...keywords].sort((a, b) => b.count - a.count).slice(0, 8); // 상위 8개만 표시
    const labels = sortedData.map(k => k.word);
    const counts = sortedData.map(k => k.count);

    // 3. 다크모드 여부에 따른 차트 테마 설정
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    // 4. Chart.js 인스턴스 생성
    keywordChartInstance = new Chart(ctx, {
        type: 'bar', // 막대 그래프 형태
        data: {
            labels: labels,
            datasets: [{
                label: '키워드 빈도/가중치',
                data: counts,
                backgroundColor: 'rgba(79, 70, 229, 0.6)', // Indigo-600
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                borderRadius: 5,
                hoverBackgroundColor: 'rgba(16, 185, 129, 0.7)', // Emerald-500 (호버 시 변화)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // 라벨이 이미 축에 있으므로 범례 숨김
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#f8fafc' : '#0f172a',
                    borderColor: 'rgba(79, 70, 229, 0.5)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return ` 중요도 지수: ${context.parsed.y}pt`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor, font: { size: 11 } },
                    grid: { color: gridColor, drawBorder: false }
                },
                x: {
                    ticks: { color: textColor, font: { size: 12, weight: 'bold' } },
                    grid: { display: false }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}
