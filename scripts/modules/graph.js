import { formatEquation } from './formatter.js';

// Переменные модуля
let functionGraph = null;
let graphContainer = null;

/**
 * Инициализирует модуль построения графиков
 */
export function initGraph() {
    graphContainer = document.getElementById('graph-container');

    // Очищаем график при сбросе формы
    const form = document.getElementById('quadratic-form');
    if (form) {
        form.addEventListener('reset', function () {
            // Скрываем график
            if (graphContainer) {
                graphContainer.classList.add('hidden');
            }

            // Если есть график, уничтожаем его
            if (functionGraph) {
                functionGraph.destroy();
                functionGraph = null;
            }
        });
    }
}

/**
 * Строит график квадратичной функции
 * @param {number} a - Коэффициент a
 * @param {number} b - Коэффициент b
 * @param {number} c - Коэффициент c
 */
export function drawGraph(a, b, c) {
    // Показываем контейнер графика
    if (!graphContainer) {
        graphContainer = document.getElementById('graph-container');
    }

    if (graphContainer) {
        graphContainer.classList.remove('hidden');
    }

    // Если график уже существует, уничтожаем его
    if (functionGraph) {
        functionGraph.destroy();
    }

    // Находим корни для определения диапазона графика
    const discriminant = b * b - 4 * a * c;
    let minX, maxX;

    if (discriminant >= 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        // Определяем границы с запасом вокруг корней
        minX = Math.min(x1, x2) - 2;
        maxX = Math.max(x1, x2) + 2;
    } else {
        // Если нет действительных корней, показываем область вокруг вершины параболы
        const vertexX = -b / (2 * a);
        minX = vertexX - 3;
        maxX = vertexX + 3;
    }

    // Создаем точки для графика
    const points = [];
    const numPoints = 100;
    const step = (maxX - minX) / numPoints;

    for (let i = 0; i <= numPoints; i++) {
        const x = minX + i * step;
        const y = a * x * x + b * x + c;
        points.push({ x, y });
    }

    // Получаем контекст канваса
    const ctx = document.getElementById('function-graph').getContext('2d');
    if (!ctx) {
        console.error('Не удалось получить контекст canvas для графика');
        return;
    }

    // Создаем график
    functionGraph = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: `y = ${formatEquation(a, b, c).replace(' = 0', '')}`,
                data: points,
                borderColor: '#3498db',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    grid: {
                        color: '#a9a9a9'
                    },
                    ticks: {
                        color: '#333',
                        font: {
                            weight: 'bold'
                        }
                    },
                    border: {
                        color: '#333',
                        width: 2
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    grid: {
                        color: '#a9a9a9'
                    },
                    ticks: {
                        color: '#333',
                        font: {
                            weight: 'bold'
                        }
                    },
                    border: {
                        color: '#333',
                        width: 2
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            const point = context.raw;
                            return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                        }
                    }
                }
            }
        }
    });
} 