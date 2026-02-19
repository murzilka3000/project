import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/app/store"
import { preloadImage, preloadVideo } from "../utils/assetLoader"
import styles from "./StartScreen.module.scss"

export const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { stories } = useSelector((state: RootState) => state.story)
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [realAssetsLoaded, setRealAssetsLoaded] = useState(false)

  useEffect(() => {
    let currentProgress = 0
    const MIN_LOADING_TIME = 2000
    const startTime = Date.now()

    const interval = setInterval(() => {
      currentProgress += 1

      if (currentProgress >= 90 && !realAssetsLoaded) {
        currentProgress = 90
      }

      if (currentProgress <= 100) {
        setProgress(currentProgress)
      }

      if (currentProgress >= 100 && realAssetsLoaded) {
        const endTime = Date.now()
        const diff = endTime - startTime
        const delay = Math.max(0, MIN_LOADING_TIME - diff)

        setTimeout(() => {
          setIsLoaded(true)
          clearInterval(interval)
        }, delay)
      }
    }, 30)

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

      stories.forEach((story, index) => {
        if (index < 2) collectAssets(story, criticalImages, criticalVideos)
        else collectAssets(story, backgroundImages, backgroundVideos)
      })

      const uniqueCritImages = Array.from(new Set(criticalImages))
      const uniqueCritVideos = Array.from(new Set(criticalVideos))

      await Promise.all([...uniqueCritImages.map(preloadImage), ...uniqueCritVideos.map(preloadVideo)])

      setRealAssetsLoaded(true)

      const uniqueBackImages = Array.from(new Set(backgroundImages))
      const uniqueBackVideos = Array.from(new Set(backgroundVideos))
      uniqueBackImages.forEach(preloadImage)
      uniqueBackVideos.forEach(preloadVideo)
    }

    loadAllAssets()

    return () => clearInterval(interval)
  }, [stories, realAssetsLoaded])

  const handleStartClick = () => {
    const audio = new Audio("/audio/effects/button-sound.mp3")
    audio.play().catch(() => {})
    onStart()
  }

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
            <button className={styles.startButton} onClick={handleStartClick}>
              <img src="/Button.svg" alt="Start" draggable={false} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
