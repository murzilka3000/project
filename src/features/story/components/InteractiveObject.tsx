import React, { useState } from "react"
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

  // Определение мобильного устройства
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    setIsMobile(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  React.useEffect(() => {
    setCurrentGif(object.gifUrl)
  }, [object.gifUrl])

  const handleInteraction = (interaction: { type: string; data: any }) => {
    switch (interaction.type) {
      case "sound":
        if (isAudioPlaying) {
          const audio = new Audio(interaction.data.soundUrl)
          audio.play().catch((e) => console.error("Ошибка воспроизведения звука:", e))
        }
        break

      case "replace":
        const { replacementGif, duration = 2000 } = interaction.data
        if (replacementGif) {
          setCurrentGif(replacementGif)
          setTimeout(() => {
            setCurrentGif(object.gifUrl)
          }, duration)
        }
        break

      case "navigate":
        // TODO: реализовать навигацию
        console.log("Navigate:", interaction.data)
        break
    }
  }

  const handleClick = () => {
    dispatch(markObjectInteraction(object.id))

    if (!object.interaction) return

    if (Array.isArray(object.interaction)) {
      object.interaction.forEach((int) => handleInteraction(int))
    } else {
      handleInteraction(object.interaction)
    }
  }

  // Выбор координат и размеров в зависимости от устройства
  const position = isMobile && object.mobilePosition ? object.mobilePosition : object.position
  const size = isMobile && object.mobileSize ? object.mobileSize : object.size

  return (
    <div
      className={`${styles.interactiveObject} ${object.noHover ? styles.noHover : ""}`}
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        width: `${size.width * 100}%`,
        height: `${size.height * 100}%`,
        zIndex: object.zIndex || 1,
      }}
      onClick={handleClick}
    >
      <img src={currentGif} alt="Interactive object" className={styles.gif} draggable={false} />
    </div>
  )
}
