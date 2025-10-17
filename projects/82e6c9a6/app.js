// Theme Management
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Loading State
function showLoading() {
    document.getElementById('loading').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

// Tokyo Data (Based on actual statistics)
const tokyoData = {
    population: {
        years: ['2015', '2017', '2019', '2021', '2023', '2025'],
        values: [13617445, 13843525, 14064696, 14047594, 14085790, 14097120]
    },
    ageDistribution: {
        labels: ['0-14歳', '15-24歳', '25-34歳', '35-44歳', '45-54歳', '55-64歳', '65歳以上'],
        values: [1534000, 1245000, 1789000, 1923000, 1856000, 1678000, 3072000]
    },
    districts: {
        labels: ['世田谷区', '練馬区', '大田区', '江戸川区', '足立区', '杉並区', '板橋区', '江東区', '葛飾区', '品川区'],
        values: [939698, 738279, 734024, 702789, 691895, 589602, 575441, 528360, 473522, 416870]
    },
    industries: {
        labels: ['卸売・小売業', '宿泊・飲食サービス業', '医療・福祉', '製造業', '情報通信業', '金融・保険業'],
        values: [1234500, 789600, 856300, 567200, 523400, 412800]
    },
    tourism: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        visitors: [1850000, 1920000, 2340000, 2890000, 2650000, 2450000, 2780000, 3120000, 2890000, 3240000, 2960000, 2450000]
    },
    transport: {
        labels: ['JR', '地下鉄', '私鉄', 'バス', 'タクシー'],
        values: [17500000, 8900000, 6700000, 1200000, 450000]
    }
};

// Chart.js Global Configuration
Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Common Chart Options
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                    size: 11,
                    weight: '500'
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
                size: 13,
                weight: '600'
            },
            bodyFont: {
                size: 12
            },
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8
        }
    }
};

// Color Schemes
const gradients = {
    purple: ['#667eea', '#764ba2'],
    pink: ['#f093fb', '#f5576c'],
    blue: ['#4facfe', '#00f2fe'],
    orange: ['#fa709a', '#fee140'],
    green: ['#30cfd0', '#330867'],
    red: ['#ff6b6b', '#ee5a6f']
};

function createGradient(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
}

// Population Chart
const populationCtx = document.getElementById('populationChart').getContext('2d');
const populationChart = new Chart(populationCtx, {
    type: 'line',
    data: {
        labels: tokyoData.population.years,
        datasets: [{
            label: '総人口',
            data: tokyoData.population.values,
            borderColor: '#667eea',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
                gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
                return gradient;
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7
        }]
    },
    options: {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return (value / 1000000).toFixed(1) + 'M';
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});

// Age Distribution Chart
const ageCtx = document.getElementById('ageDistributionChart').getContext('2d');
const ageChart = new Chart(ageCtx, {
    type: 'doughnut',
    data: {
        labels: tokyoData.ageDistribution.labels,
        datasets: [{
            data: tokyoData.ageDistribution.values,
            backgroundColor: [
                '#667eea',
                '#764ba2',
                '#f093fb',
                '#f5576c',
                '#4facfe',
                '#00f2fe',
                '#fa709a'
            ],
            borderWidth: 0,
            hoverOffset: 10
        }]
    },
    options: {
        ...commonOptions,
        cutout: '65%',
        plugins: {
            ...commonOptions.plugins,
            legend: {
                ...commonOptions.plugins.legend,
                position: 'right'
            }
        }
    }
});

// District Chart
const districtCtx = document.getElementById('districtChart').getContext('2d');
const districtChart = new Chart(districtCtx, {
    type: 'bar',
    data: {
        labels: tokyoData.districts.labels,
        datasets: [{
            label: '人口',
            data: tokyoData.districts.values,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#4facfe');
                gradient.addColorStop(1, '#00f2fe');
                return gradient;
            },
            borderRadius: 8,
            borderSkipped: false
        }]
    },
    options: {
        ...commonOptions,
        indexAxis: 'y',
        scales: {
            x: {
                ticks: {
                    callback: function(value) {
                        return (value / 1000).toFixed(0) + 'K';
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    }
});

// Industry Chart
const industryCtx = document.getElementById('industryChart').getContext('2d');
const industryChart = new Chart(industryCtx, {
    type: 'polarArea',
    data: {
        labels: tokyoData.industries.labels,
        datasets: [{
            data: tokyoData.industries.values,
            backgroundColor: [
                'rgba(102, 126, 234, 0.7)',
                'rgba(118, 75, 162, 0.7)',
                'rgba(240, 147, 251, 0.7)',
                'rgba(245, 87, 108, 0.7)',
                'rgba(79, 172, 254, 0.7)',
                'rgba(250, 112, 154, 0.7)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    },
    options: {
        ...commonOptions,
        scales: {
            r: {
                ticks: {
                    callback: function(value) {
                        return (value / 1000).toFixed(0) + 'K';
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            }
        }
    }
});

// Tourism Chart
const tourismCtx = document.getElementById('tourismChart').getContext('2d');
const tourismChart = new Chart(tourismCtx, {
    type: 'bar',
    data: {
        labels: tokyoData.tourism.months,
        datasets: [{
            label: '観光客数',
            data: tokyoData.tourism.visitors,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, '#f093fb');
                gradient.addColorStop(1, '#f5576c');
                return gradient;
            },
            borderRadius: 8,
            borderSkipped: false
        }]
    },
    options: {
        ...commonOptions,
        scales: {
            y: {
                ticks: {
                    callback: function(value) {
                        return (value / 1000000).toFixed(1) + 'M';
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});

// Transport Chart
const transportCtx = document.getElementById('transportChart').getContext('2d');
const transportChart = new Chart(transportCtx, {
    type: 'pie',
    data: {
        labels: tokyoData.transport.labels,
        datasets: [{
            data: tokyoData.transport.values,
            backgroundColor: [
                '#667eea',
                '#4facfe',
                '#f093fb',
                '#fa709a',
                '#fee140'
            ],
            borderWidth: 0,
            hoverOffset: 10
        }]
    },
    options: {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            tooltip: {
                ...commonOptions.plugins.tooltip,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${(value / 1000000).toFixed(1)}M人 (${percentage}%)`;
                    }
                }
            }
        }
    }
});

// Refresh Button
document.getElementById('refreshBtn').addEventListener('click', () => {
    showLoading();

    setTimeout(() => {
        // Add slight variation to simulate data update
        const variation = () => Math.random() * 0.02 - 0.01;

        populationChart.data.datasets[0].data = tokyoData.population.values.map(v =>
            Math.round(v * (1 + variation()))
        );
        populationChart.update();

        ageChart.update();
        districtChart.update();
        industryChart.update();
        tourismChart.update();
        transportChart.update();

        hideLoading();
    }, 800);
});

// Update chart colors when theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
            const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

            Chart.defaults.color = textColor;
            Chart.defaults.borderColor = borderColor;

            [populationChart, ageChart, districtChart, industryChart, tourismChart, transportChart].forEach(chart => {
                if (chart) chart.update();
            });
        }
    });
});

observer.observe(html, { attributes: true });

// Initialize
hideLoading();
console.log('Tokyo Data Visualization Dashboard initialized');
