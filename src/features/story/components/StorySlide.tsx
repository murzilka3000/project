import React, { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/app/store"
import { InteractiveObject } from "./InteractiveObject"
import styles from "./StorySlide.module.scss"
import { StoryNavigation } from "./StoryNavigation"
import { getVideoElement } from "../utils/assetLoader"

export const StorySlide: React.FC = () => {
  const { stories, currentStoryIndex, isAudioPlaying } = useSelector((state: RootState) => state.story)
  const currentStory = stories[currentStoryIndex]
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const prevStoryIdRef = useRef<number | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Добавили videoReady, чтобы синхронизировать появление
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 1920, height: 1080 })
  const [fadeIn, setFadeIn] = useState(false)

  const [isLayerToggled, setIsLayerToggled] = useState(false)
  const [sequenceIndex, setSequenceIndex] = useState(-1)
  const [isSequenceActive, setIsSequenceActive] = useState(false)
  const [direction, setDirection] = useState(1)
  const [isVideoSpedUp, setIsVideoSpedUp] = useState(false)

  const isVideo = (url: string | undefined) => {
    if (!url) return false
    return /\.(mp4|webm)$/i.test(url)
  }

  // --- ГЛАВНЫЙ ЭФФЕКТ ЗАГРУЗКИ ---
  useEffect(() => {
    // 1. Сброс при смене слайда
    setFadeIn(false) // Сразу скрываем контент
    setImageLoaded(false)
    setIsLayerToggled(false)
    setSequenceIndex(-1)
    setIsSequenceActive(false)
    setDirection(1)
    setIsVideoSpedUp(false)

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    if (!currentStory) return

    // Логика для КАРТИНКИ
    if (!isVideo(currentStory.backgroundImage)) {
      const src = currentStory.backgroundImage || currentStory.baseLayer
      if (src) {
        const img = new Image()
        img.src = src
        const handleImageLoad = () => {
          setImageDimensions({ width: img.width, height: img.height })
          setImageLoaded(true)
          // Небольшая задержка, чтобы браузер успел отрисовать
          requestAnimationFrame(() => setFadeIn(true))
        }
        if (img.complete) handleImageLoad()
        else {
          img.onload = handleImageLoad
          img.onerror = handleImageLoad
        }
      } else {
        setImageLoaded(true)
        setFadeIn(true)
      }
    }
    // Логика для ВИДЕО (обрабатываем только размеры и флаг loaded)
    else {
      // Для видео мы сразу говорим "загружено", но fadeIn включим в другом эффекте,
      // когда видео реально запустится
      setImageLoaded(true)

      // Если есть baseLayer, берем размеры с него (обычно видео и слой совпадают)
      if (currentStory.baseLayer) {
        const img = new Image()
        img.src = currentStory.baseLayer
        img.onload = () => setImageDimensions({ width: img.width, height: img.height })
      }
    }
  }, [currentStory?.id])

  // --- ЭФФЕКТ ДЛЯ УПРАВЛЕНИЯ ВИДЕО ---
  useEffect(() => {
    const container = videoContainerRef.current
    const prevStoryId = prevStoryIdRef.current

    // Очистка предыдущего видео
    if (prevStoryId !== null && prevStoryId !== currentStory?.id) {
      const prevStory = stories.find((s) => s.id === prevStoryId)
      if (prevStory && isVideo(prevStory.backgroundImage)) {
        const prevVideo = getVideoElement(prevStory.backgroundImage!)
        if (prevVideo) {
          prevVideo.pause()
          prevVideo.currentTime = 0 // Сброс на начало
        }
      }
    }
    prevStoryIdRef.current = currentStory?.id ?? null

    if (!container || !currentStory || !isVideo(currentStory.backgroundImage)) return

    const videoUrl = currentStory.backgroundImage!
    const cachedVideo = getVideoElement(videoUrl)

    if (cachedVideo) {
      // Стилизация
      cachedVideo.className = `${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`
      cachedVideo.style.height = currentStory.backgroundHeight || "100%"
      cachedVideo.style.width = "100%"
      cachedVideo.style.objectFit = "cover" // Важно, чтобы не дергалось
      cachedVideo.playbackRate = 1
      cachedVideo.muted = true // Гарантия автоплея
      cachedVideo.loop = true

      // Вставляем в DOM (пока невидимым из-за fadeIn=false)
      if (cachedVideo.parentNode !== container) {
        container.innerHTML = ""
        container.appendChild(cachedVideo)
      }

      // ФУНКЦИЯ БЕЗОПАСНОГО ЗАПУСКА
      const playAndFadeIn = () => {
        cachedVideo
          .play()
          .then(() => {
            // ТОЛЬКО когда промис play() выполнен успешно (кадры пошли)
            // мы включаем видимость
            requestAnimationFrame(() => setFadeIn(true))
          })
          .catch((e) => {
            console.warn("Video play error:", e)
            // Если ошибка (например, политика автоплея), все равно показываем,
            // чтобы не было черного экрана вечно
            setFadeIn(true)
          })
      }

      // Проверка готовности
      if (cachedVideo.readyState >= 3) {
        // HAVE_FUTURE_DATA - достаточно данных
        playAndFadeIn()
      } else {
        // Если не готово, ждем событие
        const onCanPlay = () => {
          playAndFadeIn()
          cachedVideo.removeEventListener("canplay", onCanPlay)
        }
        cachedVideo.addEventListener("canplay", onCanPlay)
        cachedVideo.load() // Форсируем загрузку
      }
    }
  }, [currentStory?.id, currentStory?.backgroundImage, fadeIn]) // fadeIn здесь нужен, чтобы обновить классы, но логика запуска внутри управляет setFadeIn

  // --- SEQUENCE LOGIC ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isSequenceActive && currentStory.backgroundSequence) {
      const len = currentStory.backgroundSequence.length
      const nextIndex = sequenceIndex + direction

      if (nextIndex >= 0 && nextIndex < len) {
        timeoutId = setTimeout(() => {
          setSequenceIndex(nextIndex)
          if (currentStory.sequenceSound && isAudioPlaying) {
            new Audio(currentStory.sequenceSound).play().catch(() => {})
          }
        }, currentStory.sequenceInterval || 500)
      } else {
        setIsSequenceActive(false)
      }
    }
    return () => clearTimeout(timeoutId)
  }, [sequenceIndex, isSequenceActive, direction, currentStory?.backgroundSequence, currentStory?.sequenceInterval, currentStory?.sequenceSound, isAudioPlaying])

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const isObjectClick = !!target.closest('[data-layer="objects"]')

    if (!isObjectClick && currentStory.clickSound && isAudioPlaying) {
      new Audio(currentStory.clickSound).play().catch(() => {})
    }

    if (!isObjectClick && currentStory.videoSpeedOnClick && isVideo(currentStory.backgroundImage)) {
      const video = getVideoElement(currentStory.backgroundImage!)
      if (video) {
        if (isVideoSpedUp) {
          video.playbackRate = 1
          setIsVideoSpedUp(false)
        } else {
          video.playbackRate = currentStory.videoSpeedOnClick
          setIsVideoSpedUp(true)
        }
      }
      return
    }

    if (!isObjectClick && currentStory.backgroundSequence?.length) {
      const len = currentStory.backgroundSequence.length
      if (sequenceIndex === -1) {
        setSequenceIndex(0)
        setDirection(1)
        if (currentStory.sequenceSound && isAudioPlaying) new Audio(currentStory.sequenceSound).play().catch(() => {})
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

    if (currentStory.toggleBaseLayer) {
      if (!isObjectClick) setIsLayerToggled((prev) => !prev)
    } else if (hasCustomAnimation) {
      if (isLayerToggled) return
      setIsLayerToggled(true)
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = setTimeout(() => {
        setIsLayerToggled(false)
      }, 5000)
    }
  }

  const containerStyle = {
    aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
  }

  const activeBaseLayer = isLayerToggled && currentStory.toggleBaseLayer ? currentStory.toggleBaseLayer : currentStory.baseLayer

  const renderMainBackground = (zIndex: number) => {
    const heightStyle = currentStory.backgroundHeight || "100%"

    if (isVideo(currentStory.backgroundImage)) {
      // Видео рендерится через ref, но класс fadeIn на самом видео элементе управляется в useEffect
      return <div ref={videoContainerRef} style={{ zIndex, position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }} />
    }

    const content =
      currentStory.backgroundEffect === "pan-x" ? (
        <div
          className={`${styles.animatedBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
          style={{ backgroundImage: `url(${currentStory.backgroundImage})`, height: heightStyle }}
        />
      ) : (
        <img src={currentStory.backgroundImage} alt="" className={`${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} style={{ height: heightStyle }} />
      )

    return <div style={{ zIndex, position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>{content}</div>
  }

  const behindObjects = currentStory.objects.filter((obj) => (obj.zIndex || 0) < 5)
  const frontObjects = currentStory.objects.filter((obj) => (obj.zIndex || 0) >= 5)

  const mainBgZ = currentStory.isBackgroundBottom ? 1 : 3
  const baseLayerZ = currentStory.isBackgroundBottom ? 3 : 1

  return (
    <div className={styles.storySlide}>
      <div className={styles.imageContainer} style={containerStyle} onClick={handleContainerClick}>
        {/* Загружаем картинки, они появляются вместе с флагом fadeIn */}
        {imageLoaded && (
          <img
            src={activeBaseLayer || (isVideo(currentStory.backgroundImage) ? "" : currentStory.backgroundImage)}
            alt=""
            className={`${styles.ambientBackground} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
          />
        )}

        {imageLoaded && activeBaseLayer && (
          <img src={activeBaseLayer} alt="" className={`${styles.baseLayer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`} style={{ zIndex: baseLayerZ }} />
        )}

        {imageLoaded && (
          <div className={styles.objectsLayer} style={{ zIndex: 2 }} data-layer="objects">
            {behindObjects.map((obj) => (
              <InteractiveObject key={obj.id} object={obj} isBackgroundToggled={isLayerToggled} />
            ))}
          </div>
        )}

        {/* Фон рендерится только когда imageLoaded=true, но fadeIn сработает позже для видео */}
        {imageLoaded ? renderMainBackground(mainBgZ) : <div className={styles.loader}>Loading...</div>}

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
