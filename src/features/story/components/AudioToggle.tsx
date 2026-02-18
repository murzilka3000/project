import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/app/store"
import { toggleAudio } from "../storySlice"
import styles from "./AudioToggle.module.scss"

export const AudioToggle: React.FC = () => {
  const dispatch = useDispatch()
  const { isAudioPlaying } = useSelector((state: RootState) => state.story)

  return (
    <button className={styles.audioToggle} onClick={() => dispatch(toggleAudio())} title={isAudioPlaying ? "Выключить звук" : "Включить звук"}>
      <img src={isAudioPlaying ? "/images/sound_on.svg" : "/images/sound_off.svg"} alt={isAudioPlaying ? "Sound on" : "Sound off"} />
    </button>
  )
}
