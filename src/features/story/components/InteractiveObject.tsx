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
  fileName?: string
}

interface Interaction {
  type: string
  data: InteractionData
}

interface Props {
  object: IInteractiveObject
  isBackgroundToggled?: boolean
}

export const InteractiveObject: React.FC<Props> = ({ object, isBackgroundToggled }) => {
  const dispatch = useDispatch()
  const { isAudioPlaying } = useSelector((state: RootState) => state.story)
  const [currentGif, setCurrentGif] = useState(object.gifUrl)
  const [isMobile, setIsMobile] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
          void new Audio(interaction.data.soundUrl).play().catch((e) => console.error(e))
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

      case "download": {
        if (interaction.data.url) {
          const link = document.createElement("a")
          link.href = interaction.data.url
          if (interaction.data.fileName) {
            link.download = interaction.data.fileName
          } else {
            link.setAttribute("download", "")
          }
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        break
      }

      case "navigate": {
        break
      }
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (object.id === "cat") {
      e.stopPropagation()
    }

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

  let dynamicStyles: React.CSSProperties = {}

  if (object.id === "dow") {
    dynamicStyles = {
      position: "absolute",
      top: "40px",
      left: "40px",
      width: "50px",
      height: "50px",
      padding: "10px",
      zIndex: object.zIndex || 99,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "auto",
    }
  } else {
    dynamicStyles = {
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
  }

  const containerClasses = [
    styles.interactiveObject,
    object.noHover ? styles.noHover : "",
    object.customClass ? styles[object.customClass] : "",
    isBackgroundToggled ? styles.toggled : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={containerClasses} style={dynamicStyles} onClick={handleClick}>
      <img src={currentGif} alt="" className={styles.gif} draggable={false} decoding="async" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  )
}
