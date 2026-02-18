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
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [fadeIn, setFadeIn] = useState(false)

  // Состояние переключения слоя
  const [isLayerToggled, setIsLayerToggled] = useState(false)

  // --- Логика последовательности картинок (Sequence) ---
  const [sequenceIndex, setSequenceIndex] = useState(-1)
  const [isSequenceActive, setIsSequenceActive] = useState(false)

  const isVideo = (url: string | undefined) => {
    if (!url) return false
    return /\.(mp4|webm)$/i.test(url)
  }

  // Сброс состояний при смене слайда
  useEffect(() => {
    setImageLoaded(false)
    setFadeIn(false)
    setIsLayerToggled(false)

    // Сбрасываем последовательность
    setSequenceIndex(-1)
    setIsSequenceActive(false)

    if (!currentStory) return

    // Предзагрузка (Pre-render) в DOM происходит ниже в return,
    // но JS preload оставим для надежности кеша.
    if (currentStory.backgroundSequence && currentStory.backgroundSequence.length > 0) {
      currentStory.backgroundSequence.forEach((src) => {
        const img = new Image()
        img.src = src
      })
    }

    const bgIsVideo = isVideo(currentStory.backgroundImage)
    const srcToLoad = bgIsVideo ? currentStory.baseLayer : currentStory.backgroundImage

    if (!srcToLoad) {
      setImageDimensions({ width: 1920, height: 1080 })
      setImageLoaded(true)
      setTimeout(() => setFadeIn(true), 50)
      return
    }

    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
      setImageLoaded(true)
      setTimeout(() => setFadeIn(true), 50)
    }
    img.onerror = () => {
      setImageDimensions({ width: 1920, height: 1080 })
      setImageLoaded(true)
      setTimeout(() => setFadeIn(true), 50)
    }
    img.src = srcToLoad
  }, [currentStory?.backgroundImage, currentStory?.baseLayer, currentStory?.id])

  // Эффект для переключения кадров последовательности
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isSequenceActive && currentStory.backgroundSequence) {
      if (sequenceIndex < currentStory.backgroundSequence.length - 1) {
        timeoutId = setTimeout(() => {
          setSequenceIndex((prev) => prev + 1)
        }, currentStory.sequenceInterval || 500)
      }
    }

    return () => clearTimeout(timeoutId)
  }, [sequenceIndex, isSequenceActive, currentStory?.backgroundSequence, currentStory?.sequenceInterval])

  if (!currentStory) {
    return <div>Start</div>
  }

  // --- ОБНОВЛЕННЫЙ ОБРАБОТЧИК КЛИКА ---
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    // Проверяем: клик произошел внутри слоя объектов?
    // Мы добавили data-layer="objects" в div с объектами (см. в return)
    if (target.closest('[data-layer="objects"]')) {
      // Если кликнули по объекту — ничего не делаем с фоном
      return
    }

    // 1. Приоритет: Запуск последовательности
    if (currentStory.backgroundSequence && currentStory.backgroundSequence.length > 0) {
      setSequenceIndex(0)
      setIsSequenceActive(true)
      return
    }

    // 2. Иначе: Стандартное переключение слоя
    if (currentStory.toggleBaseLayer) {
      setIsLayerToggled((prev) => !prev)
    }
  }

  const containerStyle = imageLoaded && imageDimensions.width > 0 ? { aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}` } : { aspectRatio: "9 / 16" }

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
      {/* Передаем событие 'e' в handleContainerClick */}
      <div className={styles.imageContainer} style={containerStyle} onClick={(e) => handleContainerClick(e)}>
        {/* Ambient background */}
        {imageLoaded && (
          <img
            src={activeBaseLayer || (isVideo(currentStory.backgroundImage) ? "" : currentStory.backgroundImage)}
            alt=""
            className={`${styles.ambientBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
            style={{
              display: isVideo(currentStory.backgroundImage) && !currentStory.baseLayer ? "none" : "block",
            }}
          />
        )}

        {/* Base Layer */}
        {imageLoaded && activeBaseLayer && <img src={activeBaseLayer} alt="background base" className={`${styles.baseLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} />}

        {/* Main Background (Слой 1 - Статика) */}
        {imageLoaded ? renderMainBackground() : <h1 className={styles.backgroundError}>Loading...</h1>}

        {/* Sequence Layer (Слой 2 - Анимация без моргания) */}
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
                // Важно: pointerEvents: 'none', чтобы клики проходили сквозь эти картинки
                // и попадали в контейнер (или в объекты, если они выше по Z-index)
                pointerEvents: "none",
                zIndex: 5,
                transition: "none",
              }}
            />
          ))}

        {/* Interactive Objects (Слой 3) */}
        {imageLoaded && (
          <div
            className={`${styles.objectsLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
            style={{ zIndex: 10 }}
            // Добавили атрибут-метку для проверки в onClick
            data-layer="objects"
          >
            {[...currentStory.objects]
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((object) => (
                <InteractiveObject key={object.id} object={object} />
              ))}
          </div>
        )}
        <StoryNavigation />
      </div>
    </div>
  )
}
