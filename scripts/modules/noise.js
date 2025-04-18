/**
 * Шум для фонового эффекта с поддержкой двух типов: 
 * - Шум Перлина
 * - Органический шум с domain warping
 */
export function initNoise() {
    // Конфигурация
    const config = {
        // Общие настройки
        renderScale: 1,        // Масштаб рендеринга
        fps: 60,               // Целевая частота кадров

        // Настройки шума Перлина
        noiseScale: 0.2,         // Масштаб узора шума Перлина
        noiseSpeed: 0.007,      // Скорость анимации шума Перлина
        octaves: 3,            // Количество октав шума Перлина
        lacunarity: 1.0,       // Множитель частоты для октав (Перлин)
        persistence: 0.5,      // Множитель амплитуды для октав (Перлин)

        // Настройки органического шума с domain warping
        organicSpeed: 0.03,     // Скорость анимации органического шума
        organicScale: 1.0,     // Масштаб органического шума
        organicDetail: 1.8,    // Детализация органического шума
        organicContrast: 1.8,  // Контраст органического шума
        organicDistortion: 1.2, // Сила искажения (завихрения) в органическом шуме
        organicColorIntensity: 0.9 // Интенсивность цветов органического шума
    };

    // Текущий тип шума
    let noiseType = 'perlin';

    // Текущая тема
    let isDarkTheme = document.body.classList.contains('dark-theme');

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
        uniform int u_noiseType;     // 0 - Perlin, 1 - Organic
        uniform float u_organicSpeed;
        uniform float u_organicScale;
        uniform float u_organicDetail;
        uniform float u_organicContrast;
        uniform float u_organicDistortion;
        uniform float u_organicColorIntensity;
        uniform bool u_isDarkTheme;  // Текущая тема
        
        // Функция для плавного смешивания цветов палитры
        vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
            return a + b * cos(6.28318 * (c * t + d));
        }
        
        // Хэширование
        vec3 hash33(vec3 p) {
            p = fract(p * vec3(443.8975, 397.2973, 491.1871));
            p += dot(p, p.yxz + 19.19);
            return fract((p.xxy + p.yxx) * p.zyx);
        }
        
        // Простая хэш-функция
        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
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
        
        //----------------------------------------
        // Органический шум - Domain Warping по схеме f(p) = fbm(p+fbm(p+fbm(p)))
        //----------------------------------------
        
        // 2D шум на основе хэша (быстрее, чем трехмерный шум)
        float noise2D(in vec2 x) {
            vec2 p = floor(x);
            vec2 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            
            float n = p.x + p.y * 57.0;
            float a = hash(p);
            float b = hash(p + vec2(1.0, 0.0));
            float c = hash(p + vec2(0.0, 1.0));
            float d = hash(p + vec2(1.0, 1.0));
            
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        // Базовый FBM для 2D (используется для domain warping)
        float fbm2D(in vec2 p) {
            float sum = 0.0;
            float amp = 1.0;
            float freq = 1.0;
            const int octaves = 4; // Фиксированное число октав для базового fbm
            
            for(int i = 0; i < octaves; i++) {
                sum += amp * noise2D(p * freq);
                amp *= 0.5;
                freq *= 2.0;
            }
            
            return sum;
        }
        
        // Функция domain warping для органического шума по схеме f(p) = fbm(p+fbm(p+fbm(p)))
        float domainWarpFbm(vec2 p) {
            // Применяем масштабирование и скорость анимации
            p = p * u_organicScale;
            p += u_time * u_organicSpeed;
            
            // Первый уровень искажения (innermost fbm)
            float innerFbm = fbm2D(p * 1.1);
            
            // Второй уровень искажения с применением первого
            vec2 q = p + u_organicDistortion * vec2(innerFbm, innerFbm * 0.8);
            float middleFbm = fbm2D(q * u_organicDetail);
            
            // Итоговый fbm с двойным искажением
            vec2 r = p + u_organicDistortion * 2.0 * vec2(middleFbm, middleFbm * 0.9);
            float finalFbm = fbm2D(r);
            
            // Применяем контраст
            finalFbm = pow(finalFbm, u_organicContrast);
            
            return finalFbm;
        }
        
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            
            if (u_noiseType == 0) {
                // Обычный шум Перлина - используем цвета из CSS
                vec3 p = vec3(uv * u_noiseScale, u_time);
                float n = fbm(p, u_octaves, u_lacunarity, u_persistence);
                n = pow(n, 1.5);
                vec3 color = mix(u_lowColor, u_highColor, n);
                gl_FragColor = vec4(color, 1.0);
            } 
            else {
                // Органический шум с domain warping
                vec2 q = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);
                
                // Получаем значение шума с domain warping
                float noise = domainWarpFbm(q);
                
                // Параметры для создания палитры на основе цветов темы
                vec3 baseColor, ampColor, freqColor, phaseColor;
                vec3 accentColor1, accentColor2;
                float accentIntensity1, accentIntensity2;
                
                if (u_isDarkTheme) {
                    // Темная тема - используем u_lowColor как базовый и u_highColor как акцент
                    baseColor = u_lowColor * 0.5;                     // Приглушенный базовый цвет
                    ampColor = vec3(0.8, 0.7, 0.9) * u_organicColorIntensity; // Амплитуда
                    freqColor = vec3(0.7, 0.8, 0.5);                  // Частота
                    phaseColor = vec3(0.0, 0.2, 0.4);                // Фаза
                    
                    // Акценты на основе u_highColor
                    accentColor1 = u_highColor * 1.2;                 // Усиленный яркий акцент
                    accentColor2 = vec3(
                        u_lowColor.g * 0.7, 
                        u_lowColor.b * 1.3, 
                        u_highColor.r * 0.8
                    );  // Контрастный акцент
                    
                    accentIntensity1 = 0.7;
                    accentIntensity2 = 0.3;
                } else {
                    // Светлая тема - используем u_highColor как базовый и u_lowColor как акцент
                    baseColor = mix(u_highColor, vec3(0.9, 0.9, 0.8), 0.3); // Светлый базовый с теплым оттенком
                    ampColor = vec3(0.4, 0.4, 0.3) * u_organicColorIntensity; // Амплитуда
                    freqColor = vec3(0.8, 0.7, 0.6);                  // Частота
                    phaseColor = vec3(0.4, 0.3, 0.2);                // Фаза
                    
                    // Акценты на основе u_lowColor
                    accentColor1 = mix(u_lowColor, vec3(1.0, 0.8, 0.5), 0.3); // Теплый акцент
                    accentColor2 = mix(u_highColor, vec3(0.2, 0.5, 0.8), 0.5); // Холодный акцент
                    
                    accentIntensity1 = 0.5;
                    accentIntensity2 = 0.25;
                }
                
                // Создаем базовый цвет с помощью палитры на основе цветов темы
                vec3 color = palette(
                    noise, 
                    baseColor,
                    ampColor,
                    freqColor,
                    phaseColor
                );
                
                // Добавляем первый акцент (яркий/теплый)
                float accent1 = smoothstep(0.6, 0.8, noise);
                color = mix(color, accentColor1, accent1 * accentIntensity1 * u_organicColorIntensity);
                
                // Добавляем второй акцент (контрастный/холодный)
                float accent2 = smoothstep(0.3, 0.5, sin(noise * 7.0));
                color = mix(color, accentColor2, accent2 * accentIntensity2 * u_organicColorIntensity);
                
                gl_FragColor = vec4(color, 1.0);
            }
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
        persistence: gl.getUniformLocation(program, 'u_persistence'),
        noiseType: gl.getUniformLocation(program, 'u_noiseType'),
        organicSpeed: gl.getUniformLocation(program, 'u_organicSpeed'),
        organicScale: gl.getUniformLocation(program, 'u_organicScale'),
        organicDetail: gl.getUniformLocation(program, 'u_organicDetail'),
        organicContrast: gl.getUniformLocation(program, 'u_organicContrast'),
        organicDistortion: gl.getUniformLocation(program, 'u_organicDistortion'),
        organicColorIntensity: gl.getUniformLocation(program, 'u_organicColorIntensity'),
        isDarkTheme: gl.getUniformLocation(program, 'u_isDarkTheme')
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

    // Переключение типа шума
    function setNoiseType(type) {
        noiseType = type;
        render(); // Немедленная перерисовка
    }

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

        // Обновляем флаг темной темы
        isDarkTheme = document.body.classList.contains('dark-theme');

        // Установка униформ
        gl.uniform2f(locations.resolution, canvas.width, canvas.height);
        gl.uniform1f(locations.time, frame * 0.01);
        gl.uniform3fv(locations.lowColor, lowColor);
        gl.uniform3fv(locations.highColor, highColor);
        gl.uniform1f(locations.noiseScale, config.noiseScale * 100);
        gl.uniform1i(locations.octaves, config.octaves);
        gl.uniform1f(locations.lacunarity, config.lacunarity);
        gl.uniform1f(locations.persistence, config.persistence);

        // Тип шума: 0 - Perlin, 1 - Organic
        let noiseTypeValue = 0;
        if (noiseType === 'organic') noiseTypeValue = 1;

        gl.uniform1i(locations.noiseType, noiseTypeValue);
        gl.uniform1f(locations.organicSpeed, config.organicSpeed);
        gl.uniform1f(locations.organicScale, config.organicScale);
        gl.uniform1f(locations.organicDetail, config.organicDetail);
        gl.uniform1f(locations.organicContrast, config.organicContrast);
        gl.uniform1f(locations.organicDistortion, config.organicDistortion);
        gl.uniform1f(locations.organicColorIntensity, config.organicColorIntensity);
        gl.uniform1i(locations.isDarkTheme, isDarkTheme ? 1 : 0);

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

        // Настройка переключателя типа шума
        const noiseSelector = document.getElementById('noise-type-selector');
        if (noiseSelector) {
            noiseSelector.addEventListener('change', (e) => {
                setNoiseType(e.target.value);
            });
        }

        // Запуск анимации
        requestAnimationFrame(animate);
    })();

    // Возвращаем API для внешнего управления
    return {
        setNoiseType,

        // Методы для управления параметрами органического шума
        setOrganicScale: (value) => {
            config.organicScale = value;
            render();
        },
        setOrganicDetail: (value) => {
            config.organicDetail = value;
            render();
        },
        setOrganicContrast: (value) => {
            config.organicContrast = value;
            render();
        },
        setOrganicDistortion: (value) => {
            config.organicDistortion = value;
            render();
        },
        setOrganicSpeed: (value) => {
            config.organicSpeed = value;
            render();
        },
        setOrganicColorIntensity: (value) => {
            config.organicColorIntensity = value;
            render();
        },

        // Получение текущих настроек
        getOrganicSettings: () => {
            return {
                scale: config.organicScale,
                detail: config.organicDetail,
                contrast: config.organicContrast,
                distortion: config.organicDistortion,
                speed: config.organicSpeed,
                colorIntensity: config.organicColorIntensity
            };
        }
    };
} 