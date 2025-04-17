/**
 * Шум Перлина через WebGL для фонового эффекта облаков
 */
export function initNoise() {
    // Конфигурация
    const config = {
        renderScale: 0.1,     // Масштаб рендеринга
        noiseScale: 0.1,   // Масштаб узора шума
        noiseSpeed: 0.02,    // Скорость анимации
        octaves: 3,           // Количество октав шума
        lacunarity: 1.0,      // Множитель частоты для октав
        persistence: 0.5,     // Множитель амплитуды для октав
        fps: 60               // Целевая частота кадров
    };

    // Создаем canvas если его нет
    let canvas = document.getElementById('noise-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'noise-canvas';
        canvas.className = 'noise-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    // Инициализация WebGL
    const gl = canvas.getContext('webgl', {
        alpha: false,
        premultipliedAlpha: false,
        antialias: false,
        depth: false,         // Не используем буфер глубины
        stencil: false,       // Не используем буфер трафарета
        preserveDrawingBuffer: false
    });

    if (!gl) {
        console.error('WebGL не поддерживается в этом браузере');
        return;
    }

    // Шейдеры
    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec3 u_lowColor;
        uniform vec3 u_highColor;
        uniform float u_noiseScale;
        uniform int u_octaves;
        uniform float u_lacunarity;
        uniform float u_persistence;
        
        // Хэширование
        vec3 hash33(vec3 p) {
            p = fract(p * vec3(443.8975, 397.2973, 491.1871));
            p += dot(p, p.yxz + 19.19);
            return fract((p.xxy + p.yxx) * p.zyx);
        }
        
        // Интерполяция
        float fade(float t) {
            return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
        }
        
        // Градиент
        float grad(float hash, vec3 p) {
            vec3 basis = hash33(vec3(hash));
            basis = basis * 2.0 - 1.0;
            return dot(basis, p);
        }
        
        // Шум Перлина
        float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            
            vec3 u = vec3(fade(f.x), fade(f.y), fade(f.z));
            
            float a = grad(hash33(i).x, f);
            float b = grad(hash33(i + vec3(1, 0, 0)).x, f - vec3(1, 0, 0));
            float c = grad(hash33(i + vec3(0, 1, 0)).x, f - vec3(0, 1, 0));
            float d = grad(hash33(i + vec3(1, 1, 0)).x, f - vec3(1, 1, 0));
            float e = grad(hash33(i + vec3(0, 0, 1)).x, f - vec3(0, 0, 1));
            float f1 = grad(hash33(i + vec3(1, 0, 1)).x, f - vec3(1, 0, 1));
            float g = grad(hash33(i + vec3(0, 1, 1)).x, f - vec3(0, 1, 1));
            float h = grad(hash33(i + vec3(1, 1, 1)).x, f - vec3(1, 1, 1));
            
            float v1 = mix(a, b, u.x);
            float v2 = mix(c, d, u.x);
            float v3 = mix(e, f1, u.x);
            float v4 = mix(g, h, u.x);
            
            float v5 = mix(v1, v2, u.y);
            float v6 = mix(v3, v4, u.y);
            
            return mix(v5, v6, u.z) * 0.5 + 0.5;
        }
        
        // Шум с октавами
        float fbm(vec3 p, int octaves, float lacunarity, float persistence) {
            float total = 0.0;
            float frequency = 1.0;
            float amplitude = 1.0;
            float maxValue = 0.0;
            
            for (int i = 0; i < 10; i++) {
                if (i >= octaves) break;
                
                total += noise(p * frequency) * amplitude;
                maxValue += amplitude;
                
                frequency *= lacunarity;
                amplitude *= persistence;
            }
            
            return total / maxValue;
        }
        
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            vec3 p = vec3(uv * u_noiseScale, u_time);
            
            float n = fbm(p, u_octaves, u_lacunarity, u_persistence);
            n = pow(n, 1.5);
            
            vec3 color = mix(u_lowColor, u_highColor, n);
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    // Компиляция и линковка шейдеров
    const program = (() => {
        // Создание шейдера
        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Ошибка компиляции шейдера:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        // Создание программы
        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) return null;

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Ошибка линковки программы:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }

        return program;
    })();

    if (!program) {
        console.error('Не удалось создать шейдерную программу');
        return;
    }

    // Получение ссылок на атрибуты и униформы
    const locations = {
        position: gl.getAttribLocation(program, 'a_position'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        time: gl.getUniformLocation(program, 'u_time'),
        lowColor: gl.getUniformLocation(program, 'u_lowColor'),
        highColor: gl.getUniformLocation(program, 'u_highColor'),
        noiseScale: gl.getUniformLocation(program, 'u_noiseScale'),
        octaves: gl.getUniformLocation(program, 'u_octaves'),
        lacunarity: gl.getUniformLocation(program, 'u_lacunarity'),
        persistence: gl.getUniformLocation(program, 'u_persistence')
    };

    // Создание буфера вершин
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Прямоугольник на весь экран (2 треугольника)
    const positions = [
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Состояние анимации
    let frame = 0;
    let lastFrameTime = 0;
    let lowColor = [180 / 255, 210 / 255, 230 / 255];
    let highColor = [1.0, 1.0, 1.0];
    let colorsNeedUpdate = true;

    // Обработка изменения размера
    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = Math.ceil(width * config.renderScale);
        canvas.height = Math.ceil(height * config.renderScale);

        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Обновление цветов
    function updateColors() {
        try {
            const styles = getComputedStyle(document.body);

            // Чтение CSS переменных
            const getLowColor = (component) => parseInt(styles.getPropertyValue(`--noise-low-${component}`).trim(), 10) / 255;
            const getHighColor = (component) => parseInt(styles.getPropertyValue(`--noise-high-${component}`).trim(), 10) / 255;

            lowColor = [getLowColor('r'), getLowColor('g'), getLowColor('b')];
            highColor = [getHighColor('r'), getHighColor('g'), getHighColor('b')];
        } catch (error) {
            // Используем цвета по умолчанию при ошибке
        }

        colorsNeedUpdate = false;
    }

    // Отрисовка кадра
    function render() {
        if (colorsNeedUpdate) {
            updateColors();
        }

        gl.useProgram(program);

        // Настройка атрибута вершин
        gl.enableVertexAttribArray(locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 0, 0);

        // Установка униформ
        gl.uniform2f(locations.resolution, canvas.width, canvas.height);
        gl.uniform1f(locations.time, frame * config.noiseSpeed);
        gl.uniform3fv(locations.lowColor, lowColor);
        gl.uniform3fv(locations.highColor, highColor);
        gl.uniform1f(locations.noiseScale, config.noiseScale * 100);
        gl.uniform1i(locations.octaves, config.octaves);
        gl.uniform1f(locations.lacunarity, config.lacunarity);
        gl.uniform1f(locations.persistence, config.persistence);

        // Отрисовка
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // Анимационный цикл
    function animate(timestamp) {
        // Первая отрисовка
        if (!lastFrameTime) {
            lastFrameTime = timestamp;
            render();
            frame++;
            requestAnimationFrame(animate);
            return;
        }

        // Контроль FPS
        const frameInterval = 1000 / config.fps;
        const elapsed = timestamp - lastFrameTime;

        if (elapsed >= frameInterval) {
            render();
            lastFrameTime = timestamp;
            frame++;
        }

        requestAnimationFrame(animate);
    }

    // Запуск
    (function init() {
        resize();
        updateColors();

        // Слушатели событий
        window.addEventListener('resize', () => {
            resize();
            render(); // Немедленная перерисовка после изменения размера
        });

        const themeToggle = document.getElementById('theme-toggle-checkbox');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                setTimeout(() => {
                    colorsNeedUpdate = true;
                    render(); // Немедленная перерисовка после смены темы
                }, 50);
            });
        }

        // Запуск анимации
        requestAnimationFrame(animate);
    })();
} 