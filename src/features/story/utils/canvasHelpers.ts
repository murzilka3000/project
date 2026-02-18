import { InteractiveObject } from "../types"

const imageCache = new Map<string, HTMLImageElement>()

// Оптимизированная загрузка с декодированием
export const loadImage = (url: string): Promise<HTMLImageElement> => {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.onload = () => {
      // decode() подготавливает изображение в памяти GPU
      if ("decode" in img) {
        img
          .decode()
          .then(() => {
            imageCache.set(url, img)
            resolve(img)
          })
          .catch(() => {
            imageCache.set(url, img)
            resolve(img)
          })
      } else {
        imageCache.set(url, img)
        resolve(img)
      }
    }
    img.onerror = reject
  })
}

// Проверка попадания клика (учитывает мобилки и центрирование)
export const isPointInObject = (
  x: number,
  y: number,
  object: InteractiveObject,
  canvasWidth: number,
  canvasHeight: number,
  isMobile: boolean = false // Добавили флаг мобилки
): boolean => {
  // Выбираем правильные координаты
  const pos = isMobile && object.mobilePosition ? object.mobilePosition : object.position
  const size = isMobile && object.mobileSize ? object.mobileSize : object.size

  const objX = pos.x * canvasWidth
  const objY = pos.y * canvasHeight
  const objWidth = size.width * canvasWidth
  const objHeight = size.height * canvasHeight

  let left, top

  if (object.centered) {
    // Если центрировано — точка (x,y) это центр
    left = objX - objWidth / 2
    top = objY - objHeight / 2
  } else {
    // Иначе — точка (x,y) это левый верхний угол
    left = objX
    top = objY
  }

  return x >= left && x <= left + objWidth && y >= top && y <= top + objHeight
}

// Отрисовка объекта (учитывает мобилки и центрирование)
export const drawObject = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  object: InteractiveObject,
  canvasWidth: number,
  canvasHeight: number,
  isMobile: boolean = false,
  hover: boolean = false
) => {
  const pos = isMobile && object.mobilePosition ? object.mobilePosition : object.position
  const size = isMobile && object.mobileSize ? object.mobileSize : object.size

  const x = pos.x * canvasWidth
  const y = pos.y * canvasHeight
  const width = size.width * canvasWidth
  const height = size.height * canvasHeight

  ctx.save()

  if (hover && !object.noHover) {
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
    ctx.shadowBlur = 20
  }

  // Расчет точки отрисовки в зависимости от центрирования
  const drawX = object.centered ? x - width / 2 : x
  const drawY = object.centered ? y - height / 2 : y

  ctx.drawImage(image, drawX, drawY, width, height)

  ctx.restore()
}

// Отрисовка фона
export const drawBackground = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, canvasWidth: number, canvasHeight: number) => {
  const scale = canvasHeight / image.height
  const drawWidth = image.width * scale
  const drawHeight = canvasHeight

  const offsetX = (canvasWidth - drawWidth) / 2
  const offsetY = 0

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
}
