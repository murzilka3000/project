import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/app/store"
import { InteractiveObject } from "./InteractiveObject"
import styles from "./StorySlide.module.scss"
import { StoryNavigation } from "./StoryNavigation"

export const StorySlide: React.FC = () => {
  const { stories, currentStoryIndex } = useSelector((state: RootState) => state.story)
  const currentStory = stories[currentStoryIndex]

  // Состояния для отображения
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 1920, height: 1080 })
  const [fadeIn, setFadeIn] = useState(false)

  // Состояния интерактива
  const [isLayerToggled, setIsLayerToggled] = useState(false)
  const [sequenceIndex, setSequenceIndex] = useState(-1)
  const [isSequenceActive, setIsSequenceActive] = useState(false)
  const [direction, setDirection] = useState(1)

  const isVideo = (url: string | undefined) => {
    if (!url) return false
    return /\.(mp4|webm)$/i.test(url)
  }

  // ЭФФЕКТ: Мгновенная инициализация слайда (так как всё в кэше)
  useEffect(() => {
    // 1. Сброс всех состояний предыдущего слайда
    setImageLoaded(false)
    setFadeIn(false)
    setIsLayerToggled(false)
    setSequenceIndex(-1)
    setIsSequenceActive(false)
    setDirection(1)

    if (!currentStory) return

    // 2. Получаем размеры фона (для aspectRatio)
    // Мы берем либо baseLayer, либо backgroundImage
    const bgIsVideo = isVideo(currentStory.backgroundImage)
    const src = bgIsVideo ? currentStory.baseLayer : currentStory.backgroundImage

    if (src) {
      const img = new Image()
      img.src = src
      // Так как картинка уже в кэше (после StartScreen), onload сработает почти мгновенно
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height })
        setImageLoaded(true)
        // Маленькая задержка для запуска CSS fadeIn анимации
        requestAnimationFrame(() => setFadeIn(true))
      }
      // Если по какой-то причине ошибка, все равно показываем слайд
      img.onerror = () => {
        setImageLoaded(true)
        setFadeIn(true)
      }
    } else {
      setImageLoaded(true)
      setFadeIn(true)
    }
  }, [currentStory?.id])

  // ЭФФЕКТ: Таймер для анимации последовательности (Sequence)
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

  if (!currentStory) return <div className={styles.loading}>Loading story...</div>

  // ОБРАБОТЧИК КЛИКА ПО ЭКРАНУ
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Если кликнули по InteractiveObject, блокируем клик по фону
    if (target.tagName === "IMG" && target.closest('[data-layer="objects"]')) return

    // 1. Приоритет: Анимация последовательности картинок
    if (currentStory.backgroundSequence && currentStory.backgroundSequence.length > 0) {
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

    // 2. Обычное переключение слоев или запуск customClass анимаций
    const hasCustomAnimation = currentStory.objects.some((obj) => obj.customClass)
    if (currentStory.toggleBaseLayer || hasCustomAnimation) {
      setIsLayerToggled((prev) => !prev)
    }
  }

  // Расчет пропорций контейнера
  const containerStyle = {
    aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
  }

  // Какой слой показывать в baseLayer (обычный или переключенный)
  const activeBaseLayer = isLayerToggled && currentStory.toggleBaseLayer ? currentStory.toggleBaseLayer : currentStory.baseLayer

  // Рендер основного слоя (видео или картинка)
  const renderMainBackground = (zIndex: number) => {
    const content = isVideo(currentStory.backgroundImage) ? (
      <video src={currentStory.backgroundImage} className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} autoPlay loop muted playsInline />
    ) : currentStory.backgroundEffect === "pan-x" ? (
      <div className={`${styles.animatedBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} style={{ backgroundImage: `url(${currentStory.backgroundImage})` }} />
    ) : (
      <img src={currentStory.backgroundImage} alt="" className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} />
    )

    return <div style={{ zIndex, position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>{content}</div>
  }

  // Разделение объектов на "Задние" (за основным фоном) и "Передние" (поверх всего)
  const behindObjects = currentStory.objects.filter((obj) => (obj.zIndex || 0) < 5)
  const frontObjects = currentStory.objects.filter((obj) => (obj.zIndex || 0) >= 5)

  // Z-Index логика для Sandwich-эффекта
  const mainBgZ = currentStory.isBackgroundBottom ? 1 : 3
  const baseLayerZ = currentStory.isBackgroundBottom ? 3 : 1

  return (
    <div className={styles.storySlide}>
      {/* imageContainer теперь обрезает всё лишнее внутри через styles (overflow: hidden) */}
      <div className={styles.imageContainer} style={containerStyle} onClick={handleContainerClick}>
        {/* 1. РАЗМЫТЫЙ ЗАДНИЙ ФОН (Ambient) */}
        {imageLoaded && (
          <img
            src={activeBaseLayer || (isVideo(currentStory.backgroundImage) ? "" : currentStory.backgroundImage)}
            alt=""
            className={`${styles.ambientBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
          />
        )}

        {/* 2. НИЖНИЙ СЛОЙ (baseLayer: например, Небо) */}
        {imageLoaded && activeBaseLayer && (
          <img src={activeBaseLayer} alt="" className={`${styles.baseLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} style={{ zIndex: baseLayerZ }} />
        )}

        {/* 3. СЛОЙ ОБЪЕКТОВ СЗАДИ (zIndex < 5: например, птица за окном) */}
        {imageLoaded && (
          <div className={styles.objectsLayer} style={{ zIndex: 2 }} data-layer="objects">
            {behindObjects.map((obj) => (
              <InteractiveObject key={obj.id} object={obj} isBackgroundToggled={isLayerToggled} />
            ))}
          </div>
        )}

        {/* 4. ОСНОВНОЙ СЛОЙ (backgroundImage: например, Окно или Видео) */}
        {imageLoaded ? renderMainBackground(mainBgZ) : <div className={styles.loader}>Loading assets...</div>}

        {/* 5. ПОСЛЕДОВАТЕЛЬНОСТЬ (Sequence Animation) */}
        {imageLoaded &&
          currentStory.backgroundSequence?.map((src, index) => (
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

        {/* 6. СЛОЙ ОБЪЕКТОВ СПЕРЕДИ (zIndex >= 5: например, Кот, Тюль) */}
        {imageLoaded && (
          <div className={styles.objectsLayer} style={{ zIndex: 10 }} data-layer="objects">
            {frontObjects.map((obj) => (
              <InteractiveObject key={obj.id} object={obj} isBackgroundToggled={isLayerToggled} />
            ))}
          </div>
        )}

        {/* Навигация (стрелки) */}
        <StoryNavigation />
      </div>
    </div>
  )
}
