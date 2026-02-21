import React, { useState, useEffect, useMemo } from "react"
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

  const [isMobile, setIsMobile] = useState(false)
  const [isActivated, setIsActivated] = useState(false)
  const [gifUrlWithHash, setGifUrlWithHash] = useState<string | null>(null)
  const [isGifLoading, setIsGifLoading] = useState(false)

  const replacementGif = useMemo(() => {
    if (!object.interaction) return null
    const interactions = Array.isArray(object.interaction) ? object.interaction : [object.interaction]
    const replaceAction = interactions.find((int) => int.type === "replace")
    return replaceAction?.data?.replacementGif || null
  }, [object.interaction])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    setIsMobile(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const handleInteraction = (interaction: Interaction) => {
    switch (interaction.type) {
      case "sound": {
        if (isAudioPlaying && interaction.data.soundUrl) {
          void new Audio(interaction.data.soundUrl).play().catch((e) => console.error(e))
        }
        break
      }
      case "replace": {
        if (replacementGif) {
          setIsGifLoading(true)
          // Добавляем timestamp, чтобы браузер считал гифку новой и проигрывал с 0 кадра
          setGifUrlWithHash(`${replacementGif}?t=${Date.now()}`)
          setIsActivated(true)
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

  let dynamicStyles: React.CSSProperties = {
    position: "absolute",
    cursor: "pointer",
    pointerEvents: "auto",
  }

  if (object.id === "dow") {
    dynamicStyles = {
      ...dynamicStyles,
      top: "40px",
      left: "40px",
      width: "50px",
      height: "50px",
      padding: "10px",
      zIndex: object.zIndex || 99,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }
  } else {
    dynamicStyles = {
      ...dynamicStyles,
      left: `${position.x * 100}%`,
      top: `${position.y * 100}%`,
      width: `${size.width * 100}%`,
      height: `${size.height * 100}%`,
      zIndex: object.zIndex || 1,
    }
    if (object.centered) dynamicStyles.transform = "translate(-50%, -50%)"
    if (object.maxWidth) dynamicStyles.maxWidth = object.maxWidth
  }

  return (
    <div
      className={`${styles.interactiveObject} ${object.noHover ? styles.noHover : ""} ${object.customClass ? styles[object.customClass] : ""} ${isBackgroundToggled ? styles.toggled : ""}`}
      style={dynamicStyles}
      onClick={handleClick}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Статичное изображение (база) */}
        <img
          src={object.gifUrl}
          alt=""
          className={styles.gif}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: 0,
            left: 0,
            // Скрываем статику только когда гифка реально загрузилась и готова играть
            opacity: isActivated && !isGifLoading ? 0 : 1,
          }}
        />

        {/* Гифка (динамический слой) */}
        {gifUrlWithHash && (
          <img
            src={gifUrlWithHash}
            alt=""
            className={styles.gif}
            draggable={false}
            onLoad={() => setIsGifLoading(false)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: isActivated && !isGifLoading ? 1 : 0,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  )
}
