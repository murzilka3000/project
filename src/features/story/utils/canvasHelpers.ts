import { InteractiveObject } from '../types';

// Загрузка изображений с кэшированием
const imageCache = new Map<string, HTMLImageElement>();

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Проверка попадания клика в объект
export const isPointInObject = (
  x: number,
  y: number,
  object: InteractiveObject,
  canvasWidth: number,
  canvasHeight: number
): boolean => {
  const objX = object.position.x * canvasWidth;
  const objY = object.position.y * canvasHeight;
  const objWidth = object.size.width * canvasWidth;
  const objHeight = object.size.height * canvasHeight;

  // Центрируем объект относительно позиции
  const left = objX - objWidth / 2;
  const top = objY - objHeight / 2;

  return (
    x >= left &&
    x <= left + objWidth &&
    y >= top &&
    y <= top + objHeight
  );
};

// Отрисовка объекта на canvas
export const drawObject = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  object: InteractiveObject,
  canvasWidth: number,
  canvasHeight: number,
  hover: boolean = false
) => {
  const x = object.position.x * canvasWidth;
  const y = object.position.y * canvasHeight;
  const width = object.size.width * canvasWidth;
  const height = object.size.height * canvasHeight;

  ctx.save();

  // Эффект при наведении
  if (hover) {
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 20;
    ctx.globalAlpha = 1;
  }

  // Рисуем изображение по центру координат
  ctx.drawImage(
    image,
    x - width / 2,
    y - height / 2,
    width,
    height
  );

  ctx.restore();
};

// Отрисовка фона с сохранением пропорций
// Всегда занимает 100% высоты, ширина масштабируется пропорционально
export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
) => {
  // Вычисляем ширину изображения при высоте = 100% canvas
  const scale = canvasHeight / image.height;
  const drawWidth = image.width * scale;
  const drawHeight = canvasHeight;

  // Центрируем по горизонтали (если шире canvas - обрежется по краям)
  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = 0;

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
};
