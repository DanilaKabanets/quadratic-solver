# quadratic-solver

Учебный проект для решения квадратных уравнений вида ax² + bx + c = 0.

<img width="1651" alt="image" src="https://github.com/user-attachments/assets/ea3c95e0-f0f1-4365-8f68-d02110e6d671" />

<img width="1651" alt="image" src="https://github.com/user-attachments/assets/280c0c17-76ab-4904-a1ea-e073691da258" />

<img width="1651" alt="image" src="https://github.com/user-attachments/assets/a4ee30b3-cf7a-458c-ba04-012a14a0a7d4" />

<img width="1651" alt="image" src="https://github.com/user-attachments/assets/efb1acc7-049a-433f-ad80-a41c55b32ee6" />

## Функциональность

- Ввод коэффициентов a, b, c
- Вычисление дискриминанта
- Нахождение корней уравнения
- Пошаговое решение с объяснениями
- Построение графика функции
- Сохранение истории решений
- Переключение между темной и светлой темами
- Фоновый эффект шума на WebGL

## Технологии

- Нативный JavaScript (ES6 модули)
- HTML5
- CSS3 (переменные, анимации, адаптивный дизайн)
- WebGL для фонового эффекта
- Chart.js для построения графиков
- Модульная архитектура с разделением ответственности

## Установка и запуск

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
│   ├── themes.css          # Стили для темной и светлой темы
│   ├── variables.css       # CSS переменные
│   └── noise.css           # Стили для фонового эффекта
├── scripts/                # Директория с JavaScript файлами
│   ├── main.js             # Точка входа приложения
│   └── modules/            # Модули приложения
│       ├── ui.js           # Модуль пользовательского интерфейса
│       ├── solver.js       # Модуль решения квадратных уравнений
│       ├── formatter.js    # Модуль форматирования результатов
│       ├── graph.js        # Модуль построения графиков
│       ├── history.js      # Модуль работы с историей решений
│       ├── theme.js        # Модуль управления темами
│       └── noise.js        # Модуль фонового эффекта (WebGL)
└── README.md               # Документация проекта
```

## Использование

1. Введите коэффициенты a, b и c квадратного уравнения
2. Нажмите кнопку "Решить"
3. Просмотрите результат с дискриминантом, корнями и пошаговым решением
4. Изучите график функции
5. Сохраните решение в историю для повторного доступа
6. Переключайтесь между вкладками "Калькулятор", "История" и "Теория"
7. Используйте переключатель тем для изменения внешнего вида приложения

## Особенности реализации

- **Модульная структура**: код разделен на независимые модули с единой точкой входа
- **Валидация ввода**: проверка введенных данных с информативными сообщениями об ошибках
- **Пошаговое решение**: отображение подробного решения с объяснениями
- **Графическое представление**: визуализация уравнения с помощью графика
- **Адаптивный дизайн**: корректное отображение на устройствах разных размеров
- **Оптимизированная WebGL анимация**: энергоэффективная реализация фонового эффекта
- **Доступность**: семантическая разметка и удобная навигация
