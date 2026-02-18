import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/app/store"
import { InteractiveObject } from "./InteractiveObject"
import styles from "./StorySlide.module.scss"
import { StoryNavigation } from "./StoryNavigation"

export const StorySlide: React.FC = () => {
  const { stories, currentStoryIndex } = useSelector((state: RootState) => state.story)
  const currentStory = stories[currentStoryIndex]

  const [imageLoaded, setImageLoaded] = useState(false)
  const [sequenceReady, setSequenceReady] = useState(false) // Готова ли анимация последовательности
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [fadeIn, setFadeIn] = useState(false)

  const [isLayerToggled, setIsLayerToggled] = useState(false)
  const [sequenceIndex, setSequenceIndex] = useState(-1)
  const [isSequenceActive, setIsSequenceActive] = useState(false)
  const [direction, setDirection] = useState(1)

  // Функция для проверки, является ли URL видео
  const isVideo = (url: string | undefined) => {
    if (!url) return false
    return /\.(mp4|webm)$/i.test(url)
  }

  // --- ЭФФЕКТ 1: Загрузка основного фона и ПРЕДЗАГРУЗКА последовательности ---
  useEffect(() => {
    setImageLoaded(false)
    setSequenceReady(false)
    setFadeIn(false)
    setIsLayerToggled(false)
    setSequenceIndex(-1)
    setIsSequenceActive(false)
    setDirection(1)

    if (!currentStory) return

    // Функция для полной загрузки одной картинки с ожиданием декодирования
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => {
          if ("decode" in img) {
            img
              .decode()
              .then(() => resolve())
              .catch(() => resolve())
          } else {
            resolve()
          }
        }
        img.onerror = () => resolve()
      })
    }

    const bgIsVideo = isVideo(currentStory.backgroundImage)
    const mainSrc = bgIsVideo ? currentStory.baseLayer : currentStory.backgroundImage

    if (mainSrc) {
      const mainImg = new Image()
      mainImg.src = mainSrc
      mainImg.onload = () => {
        setImageDimensions({ width: mainImg.width, height: mainImg.height })
        setImageLoaded(true)
        setTimeout(() => setFadeIn(true), 50)

        // После того как основной фон готов, грузим последовательность в фоне
        if (currentStory.backgroundSequence && currentStory.backgroundSequence.length > 0) {
          Promise.all(currentStory.backgroundSequence.map(preloadImage)).then(() => {
            setSequenceReady(true)
            console.log("Sequence fully preloaded")
          })
        }
      }
    } else {
      setImageDimensions({ width: 1920, height: 1080 })
      setImageLoaded(true)
      setTimeout(() => setFadeIn(true), 50)
    }
  }, [currentStory?.id])

  // --- ЭФФЕКТ 2: Таймер анимации (Sequence) ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isSequenceActive && currentStory.backgroundSequence) {
      const len = currentStory.backgroundSequence.length
      const nextIndex = sequenceIndex + direction

      if (nextIndex >= 0 && nextIndex < len) {
        timeoutId = setTimeout(() => {
          setSequenceIndex(nextIndex)
        }, currentStory.sequenceInterval || 500)
      } else {
        setIsSequenceActive(false)
      }
    }

    return () => clearTimeout(timeoutId)
  }, [sequenceIndex, isSequenceActive, direction, currentStory?.backgroundSequence, currentStory?.sequenceInterval])

  if (!currentStory) return <div>Start</div>

  // --- ОБРАБОТЧИК КЛИКА ---
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Если кликнули по интерактивному объекту — не запускаем клик по экрану
    if (target.closest('[data-layer="objects"]')) return

    // 1. Логика для последовательности (Sequence)
    if (currentStory.backgroundSequence && currentStory.backgroundSequence.length > 0) {
      if (!sequenceReady) return

      const len = currentStory.backgroundSequence.length
      if (sequenceIndex === -1) {
        setSequenceIndex(0)
        setDirection(1)
      } else if (sequenceIndex === len - 1) {
        setDirection(-1)
      } else if (sequenceIndex === 0) {
        setDirection(1)
      } else {
        setDirection((prev) => prev * -1)
      }
      setIsSequenceActive(true)
      return
    }

    // 2. Логика переключения слоя и активации кастомных анимаций объектов
    // Проверяем, есть ли на слайде объекты с кастомными классами анимаций
    const hasCustomAnimation = currentStory.objects.some((obj) => obj.customClass)

    // Если есть что переключать (второй слой фона ИЛИ анимация объекта)
    if (currentStory.toggleBaseLayer || hasCustomAnimation) {
      setIsLayerToggled((prev) => !prev)
    }
  }

  const containerStyle = imageLoaded ? { aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}` } : { aspectRatio: "9 / 16" }

  const activeBaseLayer = isLayerToggled && currentStory.toggleBaseLayer ? currentStory.toggleBaseLayer : currentStory.baseLayer

  const renderMainBackground = () => {
    if (isVideo(currentStory.backgroundImage)) {
      return <video src={currentStory.backgroundImage} className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} autoPlay loop muted playsInline />
    }
    if (currentStory.backgroundEffect === "pan-x") {
      return <div className={`${styles.animatedBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} style={{ backgroundImage: `url(${currentStory.backgroundImage})` }} />
    }
    return <img src={currentStory.backgroundImage} alt={currentStory.title} className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} />
  }

  return (
    <div className={styles.storySlide}>
      <div className={styles.imageContainer} style={containerStyle} onClick={handleContainerClick}>
        {/* Ambient background */}
        {imageLoaded && (
          <img
            src={activeBaseLayer || (isVideo(currentStory.backgroundImage) ? "" : currentStory.backgroundImage)}
            alt=""
            className={`${styles.ambientBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
          />
        )}

        {/* Base Layer */}
        {imageLoaded && activeBaseLayer && <img src={activeBaseLayer} alt="" className={`${styles.baseLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} />}

        {/* Слой 1: Статичный фон или видео */}
        {imageLoaded ? renderMainBackground() : <h1 className={styles.backgroundError}>Loading...</h1>}

        {/* Слой 2: Последовательность ( Sequence ) */}
        {imageLoaded &&
          currentStory.backgroundSequence &&
          currentStory.backgroundSequence.map((src, index) => (
            <img
              key={`seq-${index}`}
              src={src}
              alt=""
              className={styles.background}
              style={{
                opacity: sequenceIndex === index ? 1 : 0,
                pointerEvents: "none",
                zIndex: 5,
                transition: "none",
              }}
            />
          ))}

        {/* Слой 3: Интерактивные объекты */}
        {imageLoaded && (
          <div className={`${styles.objectsLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} style={{ zIndex: 10 }} data-layer="objects">
            {[...currentStory.objects]
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((object) => (
                <InteractiveObject key={object.id} object={object} isBackgroundToggled={isLayerToggled} />
              ))}
          </div>
        )}
        <StoryNavigation />
      </div>
    </div>
  )
}
