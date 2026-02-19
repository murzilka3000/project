// Глобальное хранилище готовых DOM-элементов видео
export const videoCache = new Map<string, HTMLVideoElement>()

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) return resolve()
    const img = new Image()
    img.src = src
    if (img.complete) resolve()
    else {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    }
  })
}

// Изменили логику: теперь мы создаем элемент, а не просто качаем blob
export const preloadVideo = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src || videoCache.has(src)) return resolve()

    const video = document.createElement("video")
    video.src = src
    video.preload = "auto"
    video.muted = true
    video.loop = true
    video.playsInline = true

    // Важно: настройки стиля, чтобы видео было готово к вставке
    video.className = "cached-video"
    video.style.position = "absolute"
    video.style.width = "100%"
    video.style.height = "100%"
    video.style.top = "0"
    video.style.left = "0"
    video.style.objectFit = "cover"

    // Событие, когда видео реально готово играть
    video.oncanplaythrough = () => {
      videoCache.set(src, video)
      resolve()
    }

    video.onerror = () => {
      console.warn("Error loading video:", src)
      resolve() // Не блокируем загрузку ошибкой
    }

    // Запускаем загрузку
    video.load()
  })
}

// Хелпер, чтобы забрать видео
export const getVideoElement = (src: string): HTMLVideoElement | null => {
  return videoCache.get(src) || null
}
