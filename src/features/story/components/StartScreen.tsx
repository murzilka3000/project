import React, { useState, useEffect } from "react"
import styles from "./StartScreen.module.scss"

interface Props {
  onStart: () => void
}

export const StartScreen: React.FC<Props> = ({ onStart }) => {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Логика таймера загрузки
  useEffect(() => {
    // Время загрузки (например, 2.5 секунды)
    const duration = 2500
    const intervalTime = 30
    const steps = duration / intervalTime
    const increment = 100 / steps

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setIsLoaded(true) // Загрузка завершена -> показываем кнопку
          return 100
        }
        return prev + increment
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [])

  // Ширина полоски загрузки для SVG
  const maxWidth = 256.9
  const currentWidth = (maxWidth * progress) / 100

  return (
    <div className={styles.startScreen}>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <h1 className={styles.title}>PLACES WE’LL GO</h1>

        <div className={styles.actionArea}>
          {!isLoaded ? (
            /* --- ЭТАП 1: ЗАГРУЗКА --- */
            <div className={styles.loadingState}>
              <div className={styles.loaderContainer}>
                <svg width="270" height="23" viewBox="0 0 270 23" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.progressBar}>
                  <rect x="6.3" y="5" width={currentWidth} height="4" fill="#9CC1C4" />
                  <rect x="6.3" y="9" width={currentWidth} height="9" fill="#5B8F9C" />
                  {/* Рамка */}
                  <rect x="6.53" width="256.9" height="5.1" fill="white" />
                  <rect y="5.1" width="6.5" height="12.7" fill="white" />
                  <rect x="263.5" y="5.1" width="6.5" height="12.7" fill="white" />
                  <rect x="6.53" y="17.8" width="256.9" height="5.1" fill="white" />
                </svg>
              </div>
              <p className={styles.loadingText}>loading...</p>
            </div>
          ) : (
            /* --- ЭТАП 2: КНОПКА START --- */
            <button className={styles.startButton} onClick={onStart}>
              <img src="/Button.svg" alt="" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
