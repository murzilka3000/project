import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/app/store"
import { preloadImage, preloadVideo } from "../utils/assetLoader"
import styles from "./StartScreen.module.scss"

export const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { stories } = useSelector((state: RootState) => state.story)
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadAllAssets = async () => {
      // 1. Собираем все уникальные ссылки на ресурсы
      const images: string[] = []
      const videos: string[] = []

      stories.forEach((story) => {
        const isVid = (url: string) => /\.(mp4|webm)$/i.test(url)

        if (story.backgroundImage) {
          isVid(story.backgroundImage) ? videos.push(story.backgroundImage) : images.push(story.backgroundImage)
        }
        if (story.baseLayer) images.push(story.baseLayer)
        if (story.toggleBaseLayer) images.push(story.toggleBaseLayer)
        if (story.backgroundSequence) images.push(...story.backgroundSequence)

        story.objects.forEach((obj) => {
          images.push(obj.gifUrl)
          if (obj.interaction) {
            const ints = Array.isArray(obj.interaction) ? obj.interaction : [obj.interaction]
            ints.forEach((i) => {
              if (i.data.replacementGif) images.push(i.data.replacementGif)
            })
          }
        })
      })

      const uniqueImages = Array.from(new Set(images))
      const uniqueVideos = Array.from(new Set(videos))
      const total = uniqueImages.length + uniqueVideos.length
      let loadedCount = 0

      const updateProgress = () => {
        loadedCount++
        setProgress(Math.round((loadedCount / total) * 100))
      }

      // 2. Запускаем загрузку
      // Сначала грузим первые 2 слайда (приоритет), потом остальные
      const imagePromises = uniqueImages.map((src) => preloadImage(src).then(updateProgress))
      const videoPromises = uniqueVideos.map((src) => preloadVideo(src).then(updateProgress))

      await Promise.all([...imagePromises, ...videoPromises])
      setIsLoaded(true)
    }

    loadAllAssets()
  }, [stories])

  const maxWidth = 256.9
  const currentWidth = (maxWidth * progress) / 100

  return (
    <div className={styles.startScreen}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>PLACES WE’LL GO</h1>
        <div className={styles.actionArea}>
          {!isLoaded ? (
            <div className={styles.loadingState}>
              <svg width="270" height="23" viewBox="0 0 270 23" fill="none" className={styles.progressBar}>
                <rect x="6.3" y="5" width={currentWidth} height="4" fill="#9CC1C4" />
                <rect x="6.3" y="9" width={currentWidth} height="9" fill="#5B8F9C" />
                <rect x="6.53" width="256.9" height="5.1" fill="white" />
                <rect y="5.1" width="6.5" height="12.7" fill="white" />
                <rect x="263.5" y="5.1" width="6.5" height="12.7" fill="white" />
                <rect x="6.53" y="17.8" width="256.9" height="5.1" fill="white" />
              </svg>
              <p className={styles.loadingText}>loading assets {progress}%</p>
            </div>
          ) : (
            <button className={styles.startButton} onClick={onStart}>
              <img src="/Button.svg" alt="Start" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
