import { initUI } from './modules/ui.js';
import { initSolver } from './modules/solver.js';
import { initGraph } from './modules/graph.js';
import { initHistory } from './modules/history.js';
import { initTheme } from './modules/theme.js';
import { initNoise } from './modules/noise.js';
// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initSolver();
    initGraph();
    initHistory();
    initTheme();
    initNoise();
});