import React, { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/app/store"
import { InteractiveObject as IInteractiveObject } from "../types"
import { markObjectInteraction } from "../storySlice"
import styles from "./InteractiveObject.module.scss"


interface InteractionData {
  soundUrl?: string
  replacementGif?: string
  duration?: number
  url?: string
  target?: string
}

interface Interaction {
  type: string
  data: InteractionData
}

interface Props {
  object: IInteractiveObject
  // Добавили проп для реакции на клик по фону слайда
  isBackgroundToggled?: boolean
}

export const InteractiveObject: React.FC<Props> = ({ object, isBackgroundToggled }) => {
  const dispatch = useDispatch()
  const { isAudioPlaying } = useSelector((state: RootState) => state.story)
  const [currentGif, setCurrentGif] = useState(object.gifUrl)
  const [isMobile, setIsMobile] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Определение мобильного устройства
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    setIsMobile(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // 2. Предзагрузка ресурсов (Preloading)
  useEffect(() => {
    setCurrentGif(object.gifUrl)

    if (object.interaction) {
      const interactions = Array.isArray(object.interaction) ? object.interaction : [object.interaction]

      interactions.forEach((int) => {
        if (int.type === "replace" && int.data.replacementGif) {
          const img = new Image()
          img.src = int.data.replacementGif
        }
        if (int.type === "sound" && int.data.soundUrl) {
          const audioPreload = new Audio(int.data.soundUrl)
          audioPreload.preload = "auto"
        }
      })
    }
  }, [object.gifUrl, object.interaction])

  const handleInteraction = (interaction: Interaction) => {
    switch (interaction.type) {
      case "sound": {
        if (isAudioPlaying && interaction.data.soundUrl) {
          void new Audio(interaction.data.soundUrl).play().catch((e) => console.error("Ошибка звука:", e))
        }
        break
      }

      case "replace": {
        const { replacementGif, duration = 2000 } = interaction.data
        if (replacementGif) {
          setCurrentGif(replacementGif)

          if (timeoutRef.current) clearTimeout(timeoutRef.current)

          timeoutRef.current = setTimeout(() => {
            setCurrentGif(object.gifUrl)
          }, duration)
        }
        break
      }

      case "link": {
        if (interaction.data.url) {
          window.open(interaction.data.url, interaction.data.target || "_blank")
        }
        break
      }

      case "navigate": {
        console.log("Navigate to:", interaction.data)
        break
      }
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(markObjectInteraction(object.id))

    if (!object.interaction) return

    if (Array.isArray(object.interaction)) {
      object.interaction.forEach((int) => handleInteraction(int as Interaction))
    } else {
      handleInteraction(object.interaction as Interaction)
    }
  }

  const position = isMobile && object.mobilePosition ? object.mobilePosition : object.position
  const size = isMobile && object.mobileSize ? object.mobileSize : object.size

  const dynamicStyles: React.CSSProperties = {
    position: "absolute",
    left: `${position.x * 100}%`,
    top: `${position.y * 100}%`,
    width: `${size.width * 100}%`,
    height: `${size.height * 100}%`,
    zIndex: object.zIndex || 1,
    cursor: "pointer",
  }

  if (object.centered) {
    dynamicStyles.transform = "translate(-50%, -50%)"
  }

  if (object.maxWidth) {
    dynamicStyles.maxWidth = object.maxWidth
  }

  // Формируем классы: базовый + noHover + кастомный класс из JSON + класс состояния фона
  const containerClasses = [
    styles.interactiveObject,
    object.noHover ? styles.noHover : "",
    object.customClass ? styles[object.customClass] : "", // Например "flyingGhost"
    isBackgroundToggled ? styles.toggled : "", // Добавляет класс .toggled если фон нажат
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={containerClasses} style={dynamicStyles} onClick={handleClick}>
      <img
        src={currentGif}
        alt=""
        className={styles.gif}
        draggable={false}
        decoding="async"
        style={object.maxWidth ? { width: "100%", height: "100%", objectFit: "contain" } : { width: "100%", height: "100%" }}
      />
    </div>
  )
}
