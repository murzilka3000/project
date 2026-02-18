import React, { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/app/store"
import { setAudioPlaying } from "../storySlice"

const FADE_DURATION = 500

export const AudioPlayer: React.FC = () => {
  const dispatch = useDispatch()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<number | null>(null)

  const { stories, currentStoryIndex, isAudioPlaying } = useSelector((state: RootState) => state.story)

  const currentStory = stories[currentStoryIndex]

  // Функция плавного затухания
  const fadeOut = (audio: HTMLAudioElement): Promise<void> => {
    return new Promise((resolve) => {
      const startVolume = audio.volume
      const steps = 20
      const stepTime = FADE_DURATION / steps
      const volumeStep = startVolume / steps
      let currentStep = 0

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++
        audio.volume = Math.max(0, startVolume - volumeStep * currentStep)

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
          }
          audio.pause()
          resolve()
        }
      }, stepTime)
    })
  }

  // Функция плавного появления
  const fadeIn = (audio: HTMLAudioElement, targetVolume: number = 1): Promise<void> => {
    return new Promise((resolve) => {
      audio.volume = 0
      const steps = 20
      const stepTime = FADE_DURATION / steps
      const volumeStep = targetVolume / steps
      let currentStep = 0

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }

      audio.play().catch((error) => {
        console.error("Ошибка воспроизведения:", error)
        dispatch(setAudioPlaying(false))
      })

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++
        audio.volume = Math.min(targetVolume, volumeStep * currentStep)

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
          }
          resolve()
        }
      }, stepTime)
    })
  }

  // Автоматическое воспроизведение с fade при смене истории
  useEffect(() => {
    const playNewTrack = async () => {
      if (!audioRef.current) return

      // Если играет другой трек, затухаем его
      if (isAudioPlaying && !audioRef.current.paused) {
        await fadeOut(audioRef.current)
      }

      // Загружаем новый трек
      audioRef.current.load()

      // Ждем, пока аудио будет готово к воспроизведению
      await new Promise<void>((resolve) => {
        if (!audioRef.current) {
          resolve()
          return
        }

        const handleCanPlay = () => {
          resolve()
        }

        audioRef.current.addEventListener("canplaythrough", handleCanPlay, { once: true })
      })

      // Запускаем с fade in
      try {
        await fadeIn(audioRef.current, 1)
        dispatch(setAudioPlaying(true))
      } catch (error) {
        console.error("Не удалось запустить аудио:", error)
        dispatch(setAudioPlaying(false))
      }
    }

    playNewTrack()

    // Очистка при размонтировании
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
    }
  }, [currentStoryIndex, dispatch])

  // Управление паузой/воспроизведением
  useEffect(() => {
    if (!audioRef.current) return

    if (isAudioPlaying && audioRef.current.paused) {
      fadeIn(audioRef.current, 1)
    } else if (!isAudioPlaying && !audioRef.current.paused) {
      fadeOut(audioRef.current)
    }
  }, [isAudioPlaying])

  return <audio ref={audioRef} src={currentStory.audioTrack} loop preload="auto" />
}
