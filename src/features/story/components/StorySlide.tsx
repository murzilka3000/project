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
  
  // Состояние переключения слоя (false = baseLayer, true = toggleBaseLayer)
  const [isLayerToggled, setIsLayerToggled] = useState(false)

  const isVideo = (url: string | undefined) => {
    if (!url) return false
    return /\.(mp4|webm)$/i.test(url)
  }

  useEffect(() => {
    setImageLoaded(false)
    setFadeIn(false)
    setIsLayerToggled(false) // Сбрасываем переключатель при смене слайда
    
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
  }, [currentStory.backgroundImage, currentStory.baseLayer, currentStory.id])

  if (!currentStory) {
    return <div>Start</div>
  }

  // Обработчик клика для переключения картинки
  const handleContainerClick = () => {
    if (currentStory.toggleBaseLayer) {
      setIsLayerToggled((prev) => !prev)
    }
  }

  const containerStyle =
    imageLoaded && imageDimensions.width > 0
      ? {
          aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
        }
      : {
          aspectRatio: "9 / 16",
        }

  // Вычисляем, какую картинку показывать в нижнем слое
  const activeBaseLayer = (isLayerToggled && currentStory.toggleBaseLayer)
    ? currentStory.toggleBaseLayer
    : currentStory.baseLayer

  const renderMainBackground = () => {
    if (isVideo(currentStory.backgroundImage)) {
      return (
        <video
          src={currentStory.backgroundImage}
          className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
          autoPlay
          loop
          muted
          playsInline
        />
      )
    }

    if (currentStory.backgroundEffect === "pan-x") {
      return (
        <div
          className={`${styles.animatedBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
          style={{ backgroundImage: `url(${currentStory.backgroundImage})` }}
        />
      )
    }

    return (
      <img
        src={currentStory.backgroundImage}
        alt={currentStory.title}
        className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
      />
    )
  }

  return (
    <div className={styles.storySlide}>
      <div 
        className={styles.imageContainer} 
        style={containerStyle}
        onClick={handleContainerClick}
      >
        
        {/* Ambient background (размытый фон) */}
        {imageLoaded && (
          <img
            src={activeBaseLayer || (isVideo(currentStory.backgroundImage) ? "" : currentStory.backgroundImage)}
            alt=""
            className={`${styles.ambientBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
            style={{ display: isVideo(currentStory.backgroundImage) && !currentStory.baseLayer ? 'none' : 'block' }}
          />
        )}

        {/* Base Layer (Нижний слой: переключается между baseLayer и toggleBaseLayer) */}
        {imageLoaded && activeBaseLayer && (
            <img 
                src={activeBaseLayer}
                alt="background base"
                className={`${styles.baseLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
            />
        )}

        {/* Main Background (Видео или Верхний слой) */}
        {imageLoaded ? (
          renderMainBackground()
        ) : (
          <h1 className={styles.backgroundError}>Loading...</h1>
        )}

        {/* Interactive Objects */}
        {imageLoaded && (
          <div className={`${styles.objectsLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
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