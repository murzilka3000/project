// src/features/story/utils/assetLoader.ts

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) return resolve()
    const img = new Image()
    img.src = src
    img.onload = () => resolve()
    img.onerror = () => {
      console.warn(`Missing asset: ${src}`)
      resolve()
    }
  })
}

export const preloadVideo = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) return resolve()
    const video = document.createElement("video")
    video.src = src
    video.preload = "auto"
    video.muted = true // Важно для автоплея
    video.oncanplaythrough = () => resolve()
    video.onerror = () => resolve()
    setTimeout(resolve, 3000)
  })
}
