import { formatResults } from './formatter.js';
import { setCurrentSolution } from './history.js';
import { drawGraph } from './graph.js';

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

        // Получаем данные формы
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const c = parseFloat(document.getElementById('c').value);

        const result = solveQuadraticEquation(a, b, c);

        // Используем форматтер для отображения результатов
        formatResults(result);

        // Строим график функции
        drawGraph(a, b, c);

        // Сохраняем текущее решение для возможности добавления в историю
        setCurrentSolution(a, b, c, result);
    });
}

export { solveQuadraticEquation };