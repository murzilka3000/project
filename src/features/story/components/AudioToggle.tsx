import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/app/store"
import { toggleAudio } from "../storySlice"
import styles from "./AudioToggle.module.scss"

export const AudioToggle: React.FC = () => {
  const dispatch = useDispatch()
  
  // Достаем индекс текущего слайда и весь массив историй
  const { isAudioPlaying, currentStoryIndex, stories } = useSelector(
    (state: RootState) => state.story
  )

  // Проверяем, является ли текущий слайд последним
  const isLastSlide = currentStoryIndex === stories.length - 1

  // Если это последний слайд — ничего не рендерим (скрываем кнопку)
  if (isLastSlide) {
    return null
  }

  // Если нужно скрыть именно на 8-м слайде (индекс 7), можно написать так:
  // if (currentStoryIndex === 7) return null

  return (
    <button 
      className={styles.audioToggle} 
      onClick={() => dispatch(toggleAudio())} 
      title={isAudioPlaying ? "Выключить звук" : "Включить звук"}
    >
      <img 
        src={isAudioPlaying ? "/images/sound_on.svg" : "/images/sound_off.svg"} 
        alt={isAudioPlaying ? "Sound on" : "Sound off"} 
        draggable={false} // Чтобы иконку нельзя было перетащить, как мы обсуждали ранее
      />
    </button>
  )
}