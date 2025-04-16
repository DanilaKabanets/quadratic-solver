import { formatEquation } from './formatter.js';
import { drawGraph } from './graph.js';

// DOM элементы
let historyList;
let clearHistoryBtn;
let saveBtn;
let currentSolution = null;

/**
 * Инициализирует модуль истории
 */
export function initHistory() {
    historyList = document.getElementById('history-list');
    clearHistoryBtn = document.getElementById('clear-history');
    saveBtn = document.getElementById('save-btn');

    // Проверяем, существуют ли элементы DOM
    if (!historyList || !clearHistoryBtn || !saveBtn) {
        console.error('Не найдены необходимые элементы DOM для модуля истории');
        return;
    }

    // Установка обработчиков событий
    saveBtn.addEventListener('click', saveCurrentSolution);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Начальное отображение истории
    renderHistory();
}

/**
 * Сохраняет текущее решение в историю
 */
function saveCurrentSolution() {
    if (!currentSolution) return;

    // Получаем текущую историю из localStorage
    let history = JSON.parse(localStorage.getItem('quadraticHistory')) || [];

    // Добавляем новое решение в начало истории
    history.unshift({
        ...currentSolution,
        timestamp: new Date().toISOString()
    });

    // Ограничиваем историю до 10 элементов
    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    // Сохраняем обновленную историю
    localStorage.setItem('quadraticHistory', JSON.stringify(history));

    // Обновляем отображение истории
    renderHistory();

    // Визуальное подтверждение сохранения
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Сохранено!';
    setTimeout(() => {
        saveBtn.textContent = originalText;
    }, 2000);
}

/**
 * Очищает историю решений
 */
function clearHistory() {
    localStorage.removeItem('quadraticHistory');
    renderHistory();
}

/**
 * Отображает историю решений
 */
export function renderHistory() {
    const history = JSON.parse(localStorage.getItem('quadraticHistory')) || [];

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">История пуста</p>';
        return;
    }

    historyList.innerHTML = '';

    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const date = new Date(item.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        historyItem.innerHTML = `
            <div class="equation">${item.equation}</div>
            <div class="result">D = ${item.discriminant}, Корни: ${item.roots}</div>
            <div class="timestamp">${formattedDate}</div>
            <span class="delete-history-item" data-index="${index}">x</span>
        `;

        // Добавляем обработчик для повторного решения при клике на элемент
        historyItem.addEventListener('click', function (e) {
            // Игнорируем клик на кнопку удаления
            if (e.target.classList.contains('delete-history-item')) return;

            // Заполняем форму и решаем уравнение
            document.getElementById('a').value = item.a;
            document.getElementById('b').value = item.b;
            document.getElementById('c').value = item.c;

            // Переключаемся на вкладку калькулятора
            const calculatorTab = document.getElementById('calculator-tab');
            const calculatorSection = document.getElementById('calculator-section');

            if (calculatorTab && calculatorSection) {
                // Вызываем клик на вкладку калькулятора
                calculatorTab.click();

                // Отправляем форму для решения уравнения
                const form = document.getElementById('quadratic-form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                } else {
                    // Если форма не найдена, построим график непосредственно здесь
                    drawGraph(item.a, item.b, item.c);
                }
            }
        });

        historyList.appendChild(historyItem);
    });

    // Обработчики для кнопок удаления отдельных элементов истории
    document.querySelectorAll('.delete-history-item').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation(); // Предотвращаем всплытие события

            const index = parseInt(btn.dataset.index);
            let history = JSON.parse(localStorage.getItem('quadraticHistory')) || [];

            // Удаляем элемент из истории
            history.splice(index, 1);

            // Сохраняем обновленную историю
            localStorage.setItem('quadraticHistory', JSON.stringify(history));

            // Обновляем отображение
            renderHistory();
        });
    });
}

/**
 * Устанавливает текущее решение для сохранения в историю
 * @param {Object} solution - Объект с данными о решенном уравнении
 */
export function setCurrentSolution(a, b, c, result) {
    // Форматируем уравнение для отображения
    const equation = formatEquation(a, b, c);

    // Форматируем корни
    let rootsText;
    if (result.roots.length === 0) {
        rootsText = 'нет действительных корней';
    } else if (result.roots[0] === '∞') {
        rootsText = 'бесконечное множество решений';
    } else if (result.roots.length === 1) {
        rootsText = `x = ${result.roots[0].toFixed(2)}`;
    } else {
        rootsText = `x₁ = ${result.roots[0].toFixed(2)}, x₂ = ${result.roots[1].toFixed(2)}`;
    }

    // Сохраняем решение
    currentSolution = {
        equation,
        discriminant: result.discriminant !== null ? result.discriminant.toFixed(2) : 'N/A',
        roots: rootsText,
        a,
        b,
        c
    };
} 