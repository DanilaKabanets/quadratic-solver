// Элементы интерфейса
const form = document.getElementById('quadratic-form');
const resultDiv = document.getElementById('result');
const discriminantDiv = document.getElementById('discriminant');
const rootsDiv = document.getElementById('roots');
const graphContainer = document.getElementById('graph-container');
const stepsDiv = document.getElementById('steps');
const historyList = document.getElementById('history-list');

// Элементы вкладок
const calculatorTab = document.getElementById('calculator-tab');
const historyTab = document.getElementById('history-tab');
const tutorialTab = document.getElementById('tutorial-tab');
const calculatorSection = document.getElementById('calculator-section');
const historySection = document.getElementById('history-section');
const tutorialSection = document.getElementById('tutorial-section');

// Кнопки
const copyBtn = document.getElementById('copy-btn');
const saveBtn = document.getElementById('save-btn');
const clearHistoryBtn = document.getElementById('clear-history');

// Форма
const aInput = document.getElementById('a');
const bInput = document.getElementById('b');
const cInput = document.getElementById('c');
const aError = document.getElementById('a-error');
const bError = document.getElementById('b-error');
const cError = document.getElementById('c-error');

// Переключение вкладок
function switchTab(tab, section) {
    // Удаляем активный класс у всех вкладок и секций
    [calculatorTab, historyTab, tutorialTab].forEach(t => t.classList.remove('active'));
    [calculatorSection, historySection, tutorialSection].forEach(s => s.classList.remove('active'));

    // Добавляем активный класс нужному табу и секции
    tab.classList.add('active');
    section.classList.add('active');
}

// Функция для валидации поля
function validateInput(input, errorElement, customValidation) {
    // Очищаем сообщение об ошибке
    errorElement.textContent = '';

    // Проверяем заполненность поля
    if (!input.value.trim()) {
        errorElement.textContent = 'Это поле не может быть пустым';
        return false;
    }

    // Проверяем, что введено число
    if (isNaN(parseFloat(input.value))) {
        errorElement.textContent = 'Введите корректное число';
        return false;
    }

    // Применяем пользовательскую валидацию, если указана
    if (customValidation && !customValidation(input.value)) {
        return false;
    }

    return true;
}

export function initUI() {
    // Обработчики клика по табам
    calculatorTab.addEventListener('click', () => switchTab(calculatorTab, calculatorSection));
    historyTab.addEventListener('click', () => {
        switchTab(historyTab, historySection);
        renderHistory();
    });
    tutorialTab.addEventListener('click', () => switchTab(tutorialTab, tutorialSection));

    // Обработчики событий для валидации в реальном времени
    aInput.addEventListener('input', function () {
        validateInput(aInput, aError);
    });

    bInput.addEventListener('input', function () {
        validateInput(bInput, bError);
    });

    cInput.addEventListener('input', function () {
        validateInput(cInput, cError);
    });

    // Обработчик сброса формы
    form.addEventListener('reset', function () {
        // Очищаем ошибки
        [aError, bError, cError].forEach(el => el.textContent = '');

        // Скрываем результаты и график
        resultDiv.classList.add('hidden');
        graphContainer.classList.add('hidden');

        // Если есть график, уничтожаем его
        if (functionGraph) {
            functionGraph.destroy();
            functionGraph = null;
        }
    });
}

export function getFormData() {
    return {
        a: parseFloat(aInput.value),
        b: parseFloat(bInput.value),
        c: parseFloat(cInput.value)
    };
}

export function showResults(discriminant, roots, steps) {
    discriminantDiv.textContent = discriminant;
    rootsDiv.textContent = roots;
    stepsDiv.innerHTML = steps;
    resultDiv.classList.remove('hidden');
}

export function showGraph(graph) {
    graphContainer.classList.remove('hidden');
    // TODO: Добавить логику отображения графика
}