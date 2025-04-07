/**
 * Модуль форматирования результатов решения квадратного уравнения
 */

/**
 * Форматирует и отображает результаты решения квадратного уравнения
 * @param {Object} result - Результат решения уравнения
 * @param {number|null} result.discriminant - Значение дискриминанта
 * @param {Array} result.roots - Массив корней уравнения
 * @param {string} result.steps - Шаги решения в HTML формате
 */
export function formatResults(result) {
    let discriminantText = result.discriminant !== null
        ? `D = ${result.discriminant}`
        : 'Линейное уравнение';

    let rootsText;
    if (result.roots.length === 0) {
        rootsText = 'Действительных корней нет';
    } else if (result.roots[0] === '∞') {
        rootsText = 'Бесконечное множество решений';
    } else {
        rootsText = `Корни: ${result.roots.join(', ')}`;
    }

    // Отображаем результаты на странице
    const resultDiv = document.getElementById('result');
    const discriminantDiv = document.getElementById('discriminant');
    const rootsDiv = document.getElementById('roots');
    const stepsDiv = document.getElementById('steps');

    if (resultDiv && discriminantDiv && rootsDiv && stepsDiv) {
        discriminantDiv.textContent = discriminantText;
        rootsDiv.textContent = rootsText;
        stepsDiv.innerHTML = result.steps;
        resultDiv.classList.remove('hidden');
    }
} 