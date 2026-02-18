# Akiaura Story - Интерактивный сторителлинг

Проект для создания интерактивных историй с анимированными объектами, фоновой музыкой и взаимодействиями.

## Особенности

- **8 историй** с уникальными фонами и музыкой
- **Интерактивные GIF объекты** с различными типами взаимодействий
- **Фоновая музыка** для каждой истории
- **Адаптивный дизайн** под любые экраны
- **Redux** для управления состоянием
- **TypeScript** для типобезопасности

## Технологии

- React 18
- TypeScript
- Redux Toolkit
- React Router
- Vite
- SCSS Modules

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Структура проекта

```
src/
  features/
    story/
      components/         - Компоненты (StorySlide, Navigation, Audio)
      types.ts           - TypeScript типы
      storySlice.ts      - Redux slice
      storiesData.ts     - Конфигурация историй (ЗДЕСЬ НАСТРАИВАТЬ!)
  pages/
    StoryPage/           - Страница с историями
    MainPage/            - Главная страница
  app/
    store.ts             - Redux store
    Routing.tsx          - Маршрутизация

public/
  images/
    story1-8/            - Папки для изображений каждой истории
  audio/
    story1-8.mp3         - Фоновая музыка
    effects/             - Звуковые эффекты
```

## Как добавить свои истории

1. **Разместите медиа файлы** в папках `public/images/storyN/` и `public/audio/`

2. **Настройте истории** в файле [src/features/story/storiesData.ts](src/features/story/storiesData.ts)

3. **Координаты объектов** - относительные (0-1):

   ```typescript
   position: { x: 0.5, y: 0.5 }  // Центр экрана
   size: { width: 0.2, height: 0.3 }  // 20% x 30% от изображения

   // Опционально: координаты для мобильных устройств (≤768px)
   mobilePosition: { x: 0.5, y: 0.55 }  // Слегка ниже на мобильных
   mobileSize: { width: 0.25, height: 0.35 }  // Больше на мобильных
   ```

4. **Типы взаимодействий**:
   - `sound` - воспроизвести звук
   - `replace` - временно заменить GIF объекта
   - `navigate` - перейти к другой истории

Подробнее см. [STORY_GUIDE.md](STORY_GUIDE.md)

## Управление

- **← Назад / Вперёд →** - навигация между историями
- **▶/⏸** - управление фоновой музыкой
- **Клик на объект** - взаимодействие

## Пример конфигурации истории

```typescript
{
  id: 1,
  title: 'Начало',
  backgroundImage: '/images/story1/background.jpg',
  audioTrack: '/audio/story1.mp3',
  objects: [
    {
      id: 'character',
      gifUrl: '/images/story1/hero.gif',
      position: { x: 0.3, y: 0.6 },
      mobilePosition: { x: 0.3, y: 0.61 }, // Координаты для мобильных
      size: { width: 0.2, height: 0.35 },
      interaction: {
        type: 'sound',
        data: { soundUrl: '/audio/effects/sound.mp3' }
      },
      zIndex: 10
    }
  ]
}
```

## Разработка

- Все координаты в относительных единицах (0-1)
- Адаптивный дизайн с поддержкой мобильных устройств
- Плавные переходы между слайдами
- Redux отслеживает прогресс и взаимодействия

## Лицензия

MIT

## Автор

Viktor Gerasimov

---

Создано с использованием React + Vite + TypeScript + Redux
