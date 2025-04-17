/**
 * Модуль управления темами приложения
 */

// DOM элементы
let themeToggle;
let themeIcon;

/**
 * Устанавливает указанную тему, обновляет UI и сохраняет выбор
 * @param {string} theme - Тема для применения ('light' или 'dark')
 */
function setTheme(theme) {
    // 1. Всегда устанавливаем атрибут data-theme для <html>
    document.documentElement.setAttribute('data-theme', theme);
    // Обновляем состояние переключателя
    if (themeToggle) themeToggle.checked = (theme === 'dark');

    // 2. Сохраняем выбор пользователя в localStorage (при каждом вызове setTheme)
    localStorage.setItem('theme', theme);

    // 3. Обновляем связанные UI элементы
    updateThemeIcon(theme === 'dark');
    updateChartTheme(theme === 'dark');
}

/**
 * Инициализация модуля темы
 */
export function initTheme() {
    themeToggle = document.getElementById('theme-toggle-checkbox');
    themeIcon = document.querySelector('.theme-icon i');

    if (!themeToggle || !themeIcon) {
        console.error('Не найдены элементы переключателя темы');
        return;
    }

    // 1. Всегда определяем начальную тему на основе системных настроек
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDarkMode ? 'dark' : 'light';

    // 2. Применяем начальную системную тему (setTheme сохранит её в localStorage)
    setTheme(initialTheme);

    // 3. Устанавливаем обработчик события для переключателя темы
    themeToggle.addEventListener('change', () => {
        // Ручное переключение также вызывает setTheme, которое сохранит новый выбор
        setTheme(themeToggle.checked ? 'dark' : 'light');
    });
}

// --- Вспомогательные функции обновления UI --- 

/**
 * Обновляет иконку в зависимости от текущей темы
 * @param {boolean} isDarkMode - Флаг темного режима
 */
function updateThemeIcon(isDarkMode) {
    if (!themeIcon) return;
    if (isDarkMode) {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

/**
 * Обновляет стиль графика при смене темы
 * @param {boolean} isDarkMode - Флаг темного режима
 */
function updateChartTheme(isDarkMode) {
    const functionGraph = document.getElementById('function-graph');
    if (!functionGraph) return;

    let chartInstance = null;
    try {
        chartInstance = Chart.getChart(functionGraph);
    } catch (e) {
        // Можно раскомментировать для отладки
        // console.warn("Не удалось получить экземпляр Chart для обновления темы", e);
        return;
    }

    if (!chartInstance) {
        // console.warn("Экземпляр Chart не найден для обновления темы.");
        return;
    }

    const gridColor = isDarkMode ? '#6272a4' : '#a9a9a9';
    const textColor = isDarkMode ? '#f8f8f2' : '#333';
    const borderColor = isDarkMode ? '#f8f8f2' : '#333';
    const dataColor = isDarkMode ? '#bd93f9' : '#3498db';

    if (chartInstance.options && chartInstance.options.scales) {
        if (chartInstance.options.scales.x) {
            if (chartInstance.options.scales.x.grid) chartInstance.options.scales.x.grid.color = gridColor;
            if (chartInstance.options.scales.x.ticks) chartInstance.options.scales.x.ticks.color = textColor;
            if (chartInstance.options.scales.x.border) chartInstance.options.scales.x.border.color = borderColor;
        }
        if (chartInstance.options.scales.y) {
            if (chartInstance.options.scales.y.grid) chartInstance.options.scales.y.grid.color = gridColor;
            if (chartInstance.options.scales.y.ticks) chartInstance.options.scales.y.ticks.color = textColor;
            if (chartInstance.options.scales.y.border) chartInstance.options.scales.y.border.color = borderColor;
        }
    }

    if (chartInstance.data && chartInstance.data.datasets && chartInstance.data.datasets.length > 0) {
        chartInstance.data.datasets[0].borderColor = dataColor;
    }

    chartInstance.update();
}