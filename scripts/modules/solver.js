import { getFormData, showResults } from './ui.js';

function solveQuadraticEquation(a, b, c) {
    let roots = [];
    let steps = [];

    // Если a = 0, уравнение становится линейным
    if (a === 0) {
        if (b === 0) {
            if (c === 0) {
                steps.push('1. Уравнение имеет вид: 0 = 0');
                steps.push('2. Уравнение имеет бесконечное множество решений');
                return {
                    discriminant: null,
                    roots: ['∞'],
                    steps: steps.join('<br>')
                };
            } else {
                steps.push('1. Уравнение имеет вид: 0 = ' + c);
                steps.push('2. Уравнение не имеет решений');
                return {
                    discriminant: null,
                    roots: [],
                    steps: steps.join('<br>')
                };
            }
        } else {
            const x = -c / b;
            steps.push('1. Уравнение является линейным: bx + c = 0');
            steps.push(`2. Решение линейного уравнения: x = -c/b = ${-c}/${b} = ${x}`);
            return {
                discriminant: null,
                roots: [x],
                steps: steps.join('<br>')
            };
        }
    }

    // Решение квадратного уравнения
    const discriminant = b * b - 4 * a * c;
    steps.push(`1. Вычисляем дискриминант: D = b² - 4ac = ${b}² - 4 * ${a} * ${c} = ${discriminant}`);

    if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        roots = [x1, x2];
        steps.push(`2. D > 0, уравнение имеет два корня:`);
        steps.push(`   x₁ = (-b + √D) / (2a) = (${-b} + √${discriminant}) / (2 * ${a}) = ${x1}`);
        steps.push(`   x₂ = (-b - √D) / (2a) = (${-b} - √${discriminant}) / (2 * ${a}) = ${x2}`);
    } else if (discriminant === 0) {
        const x = -b / (2 * a);
        roots = [x];
        steps.push(`2. D = 0, уравнение имеет один корень:`);
        steps.push(`   x = -b / (2a) = ${-b} / (2 * ${a}) = ${x}`);
    } else {
        steps.push(`2. D < 0, уравнение не имеет действительных корней`);
    }

    return {
        discriminant,
        roots,
        steps: steps.join('<br>')
    };
}

export function initSolver() {
    const form = document.getElementById('quadratic-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const { a, b, c } = getFormData();
        const result = solveQuadraticEquation(a, b, c);

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

        showResults(discriminantText, rootsText, result.steps);
    });
}