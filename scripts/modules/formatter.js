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

/**
 * Форматирует уравнение в виде строки
 * @param {number} a - Коэффициент a
 * @param {number} b - Коэффициент b
 * @param {number} c - Коэффициент c
 * @returns {string} Отформатированное уравнение
 */
export function formatEquation(a, b, c) {
    let equation = '';

    if (a === 0) {
        if (b === 0) {
            return `${c} = 0`;
        }
        equation = b === 1 ? 'x' : b === -1 ? '-x' : `${b}x`;
    } else {
        equation = a === 1 ? 'x²' : a === -1 ? '-x²' : `${a}x²`;

        if (b !== 0) {
            if (b > 0) {
                equation += ` + ${b === 1 ? '' : b}x`;
            } else {
                equation += ` - ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
            }
        }
    }

    if (c !== 0) {
        if (c > 0) {
            equation += ` + ${c}`;
        } else {
            equation += ` - ${Math.abs(c)}`;
        }
    }

    return equation + ' = 0';
} 