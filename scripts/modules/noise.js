// Генератор шума Перлина
const Perlin = (() => {
    const p = new Array(512);

    // Инициализация массива перестановок
    function init() {
        const permutation = Array.from({ length: 256 }, (_, i) => i);

        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }

        for (let i = 0; i < 256; i++) {
            p[i] = p[i + 256] = permutation[i];
        }
    }

    // Вспомогательные функции для интерполяции и градиентов
    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(t, a, b) {
        return a + t * (b - a);
    }

    function grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    // Базовая шумовая функция
    function noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = fade(x);
        const v = fade(y);
        const w = fade(z);

        const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
        const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

        return (lerp(w,
            lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
                lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
            lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
                lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1)))) + 1) / 2;
    }

    // Фрактальный шум (сумма октав)
    function fbm(x, y, z, octaves, lacunarity, persistence) {
        let total = 0;
        let frequency = 1.0;
        let amplitude = 1.0;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += noise(x * frequency, y * frequency, z) * amplitude;
            maxValue += amplitude;
            frequency *= lacunarity;
            amplitude *= persistence;
        }

        return total / maxValue;
    }

    // Инициализация при первом запуске
    init();

    // Публичный API
    return { noise, fbm };
})();

/**
 * Инициализация и управление анимированным шумовым фоном
 */
export function initNoise() {
    // Конфигурация
    const config = {
        renderScale: 0.15,    // Масштаб рендеринга (% от полного разрешения)
        noiseScale: 0.0035,    // Масштаб узора шума
        noiseSpeed: 0.025,    // Скорость анимации
        octaves: 2,           // Количество октав шума
        lacunarity: 2.0,      // Множитель частоты для октав
        persistence: 0.5,     // Множитель амплитуды для октав
        fps: 24               // Целевая частота кадров
    };

    // Создание canvas
    let canvas = document.getElementById('noise-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'noise-canvas';
        canvas.className = 'noise-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    const ctx = canvas.getContext('2d', { alpha: false });

    // Переменные состояния
    let frame = 0;
    let lastFrameTime = 0;
    let w, h, scaledWidth, scaledHeight;
    let noiseLowR = 180, noiseLowG = 210, noiseLowB = 230;
    let noiseHighR = 255, noiseHighG = 255, noiseHighB = 255;
    let colorsNeedUpdate = true;
    let imageData;

    // Настройка размера canvas
    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;

        scaledWidth = Math.ceil(w * config.renderScale);
        scaledHeight = Math.ceil(h * config.renderScale);

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        // Создаем новый ImageData при изменении размера
        imageData = ctx.createImageData(scaledWidth, scaledHeight);
    }

    // Обновление цветов из CSS переменных
    function updateColors() {
        try {
            const styles = getComputedStyle(document.body);

            // Чтение CSS переменных
            const getLowColor = (component) => parseInt(styles.getPropertyValue(`--noise-low-${component}`).trim(), 10);
            const getHighColor = (component) => parseInt(styles.getPropertyValue(`--noise-high-${component}`).trim(), 10);

            const newLowR = getLowColor('r');
            const newLowG = getLowColor('g');
            const newLowB = getLowColor('b');
            const newHighR = getHighColor('r');
            const newHighG = getHighColor('g');
            const newHighB = getHighColor('b');

            // Обновляем только если цвета изменились
            if (newLowR !== noiseLowR || newLowG !== noiseLowG || newLowB !== noiseLowB ||
                newHighR !== noiseHighR || newHighG !== noiseHighG || newHighB !== noiseHighB) {

                noiseLowR = newLowR;
                noiseLowG = newLowG;
                noiseLowB = newLowB;
                noiseHighR = newHighR;
                noiseHighG = newHighG;
                noiseHighB = newHighB;
            }
        } catch (error) {
            console.debug('Используем цвета по умолчанию для шума');
            // Значения по умолчанию уже установлены выше
        }

        colorsNeedUpdate = false;
    }

    // Генерация кадра шума
    function generateFrame(zOffset) {
        if (colorsNeedUpdate) {
            updateColors();
        }

        const data = imageData.data;

        for (let y = 0; y < scaledHeight; y++) {
            for (let x = 0; x < scaledWidth; x++) {
                const i = (y * scaledWidth + x) * 4;

                // Нормализованные координаты для шума
                const nx = x / scaledWidth * w * config.noiseScale;
                const ny = y / scaledHeight * h * config.noiseScale;

                // Значение шума
                const noiseValue = Perlin.fbm(
                    nx, ny, zOffset,
                    config.octaves, config.lacunarity, config.persistence
                );

                // Нелинейное преобразование для контрастности
                const brightness = Math.pow(noiseValue, 1.5);

                // Интерполяция между цветами
                data[i] = Math.round(noiseLowR + brightness * (noiseHighR - noiseLowR));
                data[i + 1] = Math.round(noiseLowG + brightness * (noiseHighG - noiseLowG));
                data[i + 2] = Math.round(noiseLowB + brightness * (noiseHighB - noiseLowB));
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Анимационный цикл с контролем частоты кадров
    function animate(timestamp) {
        if (!lastFrameTime) {
            lastFrameTime = timestamp;
        }

        const frameInterval = 1000 / config.fps;
        const elapsed = timestamp - lastFrameTime;

        if (elapsed >= frameInterval) {
            const zOffset = frame * config.noiseSpeed;
            generateFrame(zOffset);
            lastFrameTime = timestamp;
            frame++;
        }

        requestAnimationFrame(animate);
    }

    // Инициализация
    function init() {
        // Первоначальная настройка
        resize();
        updateColors();

        // Обработчики событий
        window.addEventListener('resize', () => {
            resize();
            colorsNeedUpdate = true;
        });

        const themeToggle = document.getElementById('theme-toggle-checkbox');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                setTimeout(() => colorsNeedUpdate = true, 50);
            });
        }

        // Запуск анимации
        requestAnimationFrame(animate);
    }

    // Запуск
    init();
} 