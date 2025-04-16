# quadratic-solver

Учебный проект для решения квадратных уравнений вида ax² + bx + c = 0.

### Функциональность

- Ввод коэффициентов a, b, c
- Вычисление дискриминанта
- Нахождение корней
- Построение графика функции
- История решений
- Переключение темы оформления
- Пошаговое решение

### Технологии

- JavaScript (ES6+)
- HTML5
- CSS3

### Установка и запуск

1. Клонируйте репозиторий:
   ```
   git clone https://github.com/DanilaKabanets/quadratic-solver.git
   ```
2. Откройте файл `index.html` в браузере

## Структура проекта

```
.
├── index.html              # Главная HTML страница приложения
├── styles/                 # Директория с CSS стилями
│   ├── style.css           # Основные стили приложения
│   ├── themes.css          # Стили для тем оформления
│   └── variables.css       # CSS переменные
├── scripts/                # Директория с JavaScript файлами
│   ├── main.js             # Главный файл инициализации приложения
│   └── modules/            # Модули приложения
│       ├── formatter.js    # Форматирование результатов
│       ├── graph.js        # Построение графиков
│       ├── history.js      # Работа с историей решений
│       ├── solver.js       # Логика решения уравнений
│       ├── theme.js        # Управление темой оформления
│       └── ui.js           # Управление интерфейсом
└── README.md               # Документация проекта
```

## Использование

### 1. Переключение между секциями

Приложение разделено на три основные секции с помощью вкладок: "Калькулятор", "История" и "Теория".

- **Калькулятор:** Здесь находится форма для ввода коэффициентов и отображаются результаты решения, включая пошаговое объяснение и график функции.
- **История:** В этой секции отображается список ранее решенных уравнений. Каждая запись включает введенные коэффициенты и полученные результаты. Вы можете очистить всю историю с помощью кнопки "Очистить историю".
- **Теория:** Здесь представлена краткая теоретическая справка о квадратных уравнениях, включая формулы дискриминанта и корней, а также примеры решения.

Навигация между секциями осуществляется нажатием на соответствующие вкладки в шапке приложения.

### 2. Решение уравнения

1.  **Перейдите на вкладку "Калькулятор".**
2.  **Введите коэффициенты:** Заполните поля `a`, `b` и `c`. Обратите внимание, что коэффициент `a` не может быть равен нулю. Валидация происходит в реальном времени, и сообщения об ошибках будут показаны под соответствующим полем, если введенные данные некорректны (например, пустое поле или нечисловое значение).
3.  **Нажмите кнопку "Решить":** После ввода корректных коэффициентов нажмите кнопку "Решить".
4.  **Просмотрите результат:** Ниже формы появятся:
    - Значение дискриминанта.
    - Найденные корни уравнения (или сообщение об их отсутствии).
    - Раздел "Пошаговое решение" с объяснением каждого шага вычислений.
    - График параболы y = ax² + bx + c, построенный на основе введенных коэффициентов.
5.  **Дополнительные действия:**
    - **Копировать результат:** Нажмите кнопку "Копировать результат", чтобы скопировать текстовое представление решения в буфер обмена.
    - **Сохранить в историю:** Нажмите кнопку "Сохранить в историю", чтобы добавить текущее решение в список на вкладке "История".
    - **Сбросить:** Нажмите кнопку "Сбросить", чтобы очистить поля ввода, скрыть результаты и график.

### 3. Управление темой

В правом верхнем углу страницы находится переключатель темы. Используйте его для переключения между светлым и темным оформлением интерфейса. Выбранная тема сохраняется при перезагрузке страницы.
