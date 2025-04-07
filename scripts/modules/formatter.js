/**
 * Форматирует результат решения квадратного уравнения для отображения
 * @param {Object} result - Результат решения уравнения
 * @returns {Object} Отформатированные данные для отображения
 */
export function formatQuadraticResult(result) {
    const discriminantText = result.discriminant !== null
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

    return {
        discriminantText,
        rootsText,
        steps: result.steps
    };
} 