export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) return resolve()
    const img = new Image()
    img.src = src
    // Если картинка уже в кэше, onload сработает мгновенно
    if (img.complete) {
      resolve()
    } else {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    }
  })
}

export const preloadVideo = async (src: string): Promise<void> => {
  if (!src) return
  try {
    const response = await fetch(src)
    await response.blob()
  } catch {
    // Просто убираем (e)
    console.warn("Video preload failed", src)
  }
}
