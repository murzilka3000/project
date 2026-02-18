import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/app/store"
import { InteractiveObject as IInteractiveObject } from "../types"
import { markObjectInteraction } from "../storySlice"
import styles from "./InteractiveObject.module.scss"

interface Props {
  object: IInteractiveObject
}

export const InteractiveObject: React.FC<Props> = ({ object }) => {
  const dispatch = useDispatch()
  const { isAudioPlaying } = useSelector((state: RootState) => state.story)
  const [currentGif, setCurrentGif] = useState(object.gifUrl)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    setIsMobile(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    setCurrentGif(object.gifUrl)
  }, [object.gifUrl])

  const handleInteraction = (interaction: { type: string; data: any }) => {
    switch (interaction.type) {
      case "sound":
        if (isAudioPlaying) {
          const audio = new Audio(interaction.data.soundUrl)
          audio.play().catch((e) => console.error("Ошибка:", e))
        }
        break
      case "replace":
        const { replacementGif, duration = 2000 } = interaction.data
        if (replacementGif) {
          setCurrentGif(replacementGif)
          setTimeout(() => setCurrentGif(object.gifUrl), duration)
        }
        break
      case "link":
        if (interaction.data?.url) {
          window.open(interaction.data.url, interaction.data.target || "_blank")
        }
        break
      case "navigate":
        console.log("Navigate:", interaction.data)
        break
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Останавливаем всплытие, чтобы клик по объекту не считался кликом по фону
    e.stopPropagation()
    dispatch(markObjectInteraction(object.id))
    if (!object.interaction) return
    if (Array.isArray(object.interaction)) {
      object.interaction.forEach((int) => handleInteraction(int))
    } else {
      handleInteraction(object.interaction)
    }
  }

  const position = isMobile && object.mobilePosition ? object.mobilePosition : object.position
  const size = isMobile && object.mobileSize ? object.mobileSize : object.size

  // Формируем стили динамически, чтобы не добавлять лишнего
  const dynamicStyles: React.CSSProperties = {
    left: `${position.x * 100}%`,
    top: `${position.y * 100}%`,
    width: `${size.width * 100}%`,
    height: `${size.height * 100}%`,
    zIndex: object.zIndex || 1,
    cursor: "pointer",
  }

  // Если в JSON явно указано centered, только тогда добавляем transform
  if (object.centered) {
    dynamicStyles.transform = "translate(-50%, -50%)"
  }

  // Если указано maxWidth, добавляем его
  if (object.maxWidth) {
    dynamicStyles.maxWidth = object.maxWidth
  }

  return (
    <div className={`${styles.interactiveObject} ${object.noHover ? styles.noHover : ""}`} style={dynamicStyles} onClick={handleClick}>
      <img
        src={currentGif}
        alt="Interactive object"
        className={styles.gif}
        draggable={false}
        // Если есть maxWidth, картинка должна вписываться, иначе оставляем как было
        style={object.maxWidth ? { width: "100%", height: "100%", objectFit: "contain" } : {}}
      />
    </div>
  )
}
