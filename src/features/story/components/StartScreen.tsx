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
      const criticalImages: string[] = []
      const criticalVideos: string[] = []
      const backgroundImages: string[] = []
      const backgroundVideos: string[] = []

      const isVid = (url: string) => /\.(mp4|webm)$/i.test(url)

      const collectAssets = (story: (typeof stories)[0], imgArray: string[], vidArray: string[]) => {
        if (story.backgroundImage) {
          if (isVid(story.backgroundImage)) {
            vidArray.push(story.backgroundImage)
          } else {
            imgArray.push(story.backgroundImage)
          }
        }
        if (story.baseLayer) imgArray.push(story.baseLayer)
        if (story.toggleBaseLayer) imgArray.push(story.toggleBaseLayer)
        if (story.backgroundSequence) imgArray.push(...story.backgroundSequence)

        story.objects.forEach((obj) => {
          if (obj.gifUrl) imgArray.push(obj.gifUrl)
          if (obj.interaction) {
            const interactions = Array.isArray(obj.interaction) ? obj.interaction : [obj.interaction]
            interactions.forEach((int) => {
              if (int.data?.replacementGif) imgArray.push(int.data.replacementGif)
            })
          }
        })
      }

      // 1. Распределяем ресурсы: первые 2 слайда - критические, остальные - фон
      stories.forEach((story, index) => {
        if (index < 2) {
          collectAssets(story, criticalImages, criticalVideos)
        } else {
          collectAssets(story, backgroundImages, backgroundVideos)
        }
      })

      const uniqueCritImages = Array.from(new Set(criticalImages))
      const uniqueCritVideos = Array.from(new Set(criticalVideos))
      const totalCritical = uniqueCritImages.length + uniqueCritVideos.length
      let loadedCount = 0

      const updateProgress = () => {
        loadedCount++
        if (totalCritical > 0) {
          setProgress(Math.round((loadedCount / totalCritical) * 100))
        }
      }

      // 2. Загружаем критические ресурсы
      if (totalCritical === 0) {
        setIsLoaded(true)
      } else {
        const imagePromises = uniqueCritImages.map((src) => preloadImage(src).then(updateProgress))
        const videoPromises = uniqueCritVideos.map((src) => preloadVideo(src).then(updateProgress))
        await Promise.all([...imagePromises, ...videoPromises])
        setIsLoaded(true)
      }

      // 3. Загружаем всё остальное в фоне
      const uniqueBackImages = Array.from(new Set(backgroundImages))
      const uniqueBackVideos = Array.from(new Set(backgroundVideos))

      uniqueBackImages.forEach((src) => {
        preloadImage(src).catch((err) => console.warn("Background image failed:", err))
      })
      uniqueBackVideos.forEach((src) => {
        preloadVideo(src).catch((err) => console.warn("Background video failed:", err))
      })
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
