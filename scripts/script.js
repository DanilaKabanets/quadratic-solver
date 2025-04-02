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

// Обработчики клика по табам
calculatorTab.addEventListener('click', () => switchTab(calculatorTab, calculatorSection));
historyTab.addEventListener('click', () => {
    switchTab(historyTab, historySection);
    renderHistory();
});
tutorialTab.addEventListener('click', () => switchTab(tutorialTab, tutorialSection));