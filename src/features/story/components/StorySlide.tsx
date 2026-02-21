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

  useEffect(() => {
    setFadeIn(false)
    setIsLayerToggled(false)
    setSequenceIndex(-1)
    setIsSequenceActive(false)
    setDirection(1)
    setIsVideoSpedUp(false)

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    if (!currentStory) return

    const src = isVideo(currentStory.backgroundImage) ? currentStory.baseLayer : currentStory.backgroundImage

    if (src) {
      const img = new Image()
      img.src = src

      const updateImage = () => {
        setImageDimensions({ width: img.width, height: img.height })
        setImageLoaded(true)
        requestAnimationFrame(() => setFadeIn(true))
      }

      if (img.complete) {
        updateImage()
      } else {
        img.onload = updateImage
        img.onerror = updateImage
      }
    } else {
      setImageLoaded(true)
      setFadeIn(true)
    }
  }, [currentStory?.id])

  useEffect(() => {
    const container = videoContainerRef.current

    const prevStoryId = prevStoryIdRef.current
    const prevStory = prevStoryId !== null ? stories.find((s) => s.id === prevStoryId) : null

    if (prevStory && isVideo(prevStory.backgroundImage)) {
      const prevVideo = getVideoElement(prevStory.backgroundImage!)
      if (prevVideo && prevVideo.parentNode) {
        prevVideo.parentNode.removeChild(prevVideo)
        prevVideo.pause()
        prevVideo.playbackRate = 1
      }
    }

    prevStoryIdRef.current = currentStory?.id ?? null

    if (!container || !currentStory) return

    if (isVideo(currentStory.backgroundImage)) {
      const cachedVideo = getVideoElement(currentStory.backgroundImage!)

      if (cachedVideo) {
        cachedVideo.className = `${styles.background} ${fadeIn ? styles.fadeIn : styles.fadeOut}`
        cachedVideo.style.height = currentStory.backgroundHeight || "100%"
        cachedVideo.playbackRate = 1

        if (cachedVideo.parentNode !== container) {
          container.innerHTML = ""
          container.appendChild(cachedVideo)
        }

        cachedVideo.play().catch(() => {})
      }
    }
  }, [currentStory?.id, fadeIn, currentStory?.backgroundHeight, stories])

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
    if (currentStory.clickSound && isAudioPlaying) {
      const audio = new Audio(currentStory.clickSound)
      audio.play().catch(() => {})
    }

    if (currentStory.videoSpeedOnClick && isVideo(currentStory.backgroundImage)) {
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

    if (currentStory.backgroundSequence && currentStory.backgroundSequence.length > 0) {
      const len = currentStory.backgroundSequence.length
      if (sequenceIndex === -1) {
        setSequenceIndex(0)
        setDirection(1)
        if (currentStory.sequenceSound && isAudioPlaying) {
          new Audio(currentStory.sequenceSound).play().catch(() => {})
        }
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
      setIsLayerToggled((prev) => !prev)
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

        {imageLoaded ? renderMainBackground(mainBgZ) : <div className={styles.loader}>Loading assets...</div>}

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
