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
  const [sequenceReady, setSequenceReady] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [fadeIn, setFadeIn] = useState(false)

  const [isLayerToggled, setIsLayerToggled] = useState(false)
  const [sequenceIndex, setSequenceIndex] = useState(-1)
  const [isSequenceActive, setIsSequenceActive] = useState(false)
  const [direction, setDirection] = useState(1)

  const isVideo = (url: string | undefined) => {
    if (!url) return false
    return /\.(mp4|webm)$/i.test(url)
  }

  useEffect(() => {
    setImageLoaded(false)
    setSequenceReady(false)
    setFadeIn(false)
    setIsLayerToggled(false)
    setSequenceIndex(-1)
    setIsSequenceActive(false)
    setDirection(1)

    if (!currentStory) return

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

        if (currentStory.backgroundSequence && currentStory.backgroundSequence.length > 0) {
          Promise.all(currentStory.backgroundSequence.map(preloadImage)).then(() => {
            setSequenceReady(true)
          })
        }
      }
    } else {
      setImageDimensions({ width: 1920, height: 1080 })
      setImageLoaded(true)
      setTimeout(() => setFadeIn(true), 50)
    }
  }, [currentStory?.id])

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
  }, [sequenceIndex, isSequenceActive, direction, currentStory?.backgroundSequence])

  if (!currentStory) return <div>Start</div>

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "IMG" && target.closest('[data-layer="objects"]')) return

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

    const hasCustomAnimation = currentStory.objects.some((obj) => obj.customClass)
    if (currentStory.toggleBaseLayer || hasCustomAnimation) {
      setIsLayerToggled((prev) => !prev)
    }
  }

  const containerStyle = imageLoaded ? { aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}` } : { aspectRatio: "9 / 16" }

  const activeBaseLayer = isLayerToggled && currentStory.toggleBaseLayer ? currentStory.toggleBaseLayer : currentStory.baseLayer

  const renderMainBackground = (zIndex: number) => {
    const content = isVideo(currentStory.backgroundImage) ? (
      <video src={currentStory.backgroundImage} className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} autoPlay loop muted playsInline />
    ) : currentStory.backgroundEffect === "pan-x" ? (
      <div className={`${styles.animatedBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} style={{ backgroundImage: `url(${currentStory.backgroundImage})` }} />
    ) : (
      <img src={currentStory.backgroundImage} alt={currentStory.title} className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} />
    )

    return <div style={{ zIndex, position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>{content}</div>
  }

  // Объекты слоями
  const behindObjects = currentStory.objects.filter((obj) => (obj.zIndex || 0) < 5)
  const frontObjects = currentStory.objects.filter((obj) => (obj.zIndex || 0) >= 5)

  // ОПРЕДЕЛЯЕМ ПОРЯДОК СЛОЕВ
  // Если isBackgroundBottom: true, то видео на zIndex 1, а комната на zIndex 3
  // Если false (по умолчанию), то комната на 1, а видео на 3
  const mainBgZ = currentStory.isBackgroundBottom ? 1 : 3
  const baseLayerZ = currentStory.isBackgroundBottom ? 3 : 1

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

        {/* 1. Слой baseLayer (Комната или Небо) */}
        {imageLoaded && activeBaseLayer && (
          <img src={activeBaseLayer} alt="" className={`${styles.baseLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} style={{ zIndex: baseLayerZ }} />
        )}

        {/* 2. Объекты сзади (Птица) */}
        {imageLoaded && (
          <div className={styles.objectsLayer} style={{ zIndex: 2 }} data-layer="objects">
            {behindObjects.map((obj) => (
              <InteractiveObject key={obj.id} object={obj} isBackgroundToggled={isLayerToggled} />
            ))}
          </div>
        )}

        {/* 3. Основной фон (Видео или Окно) */}
        {imageLoaded ? renderMainBackground(mainBgZ) : <h1 className={styles.backgroundError}>Loading...</h1>}

        {/* 4. Sequence Layer */}
        {imageLoaded &&
          currentStory.backgroundSequence?.map((src, index) => (
            <img
              key={`seq-${index}`}
              src={src}
              alt=""
              className={styles.background}
              style={{ opacity: sequenceIndex === index ? 1 : 0, pointerEvents: "none", zIndex: 5, transition: "none" }}
            />
          ))}

        {/* 5. Объекты спереди (Кот, Тюль) */}
        {imageLoaded && (
          <div className={styles.objectsLayer} style={{ zIndex: 10 }} data-layer="objects">
            {frontObjects.map((obj) => (
              <InteractiveObject key={obj.id} object={obj} isBackgroundToggled={isLayerToggled} />
            ))}
          </div>
        )}

        <StoryNavigation />
      </div>
    </div>
  )
}
