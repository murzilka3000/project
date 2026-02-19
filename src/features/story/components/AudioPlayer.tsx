import React, { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/app/store"
import { setAudioPlaying, nextStory } from "../storySlice"

const FADE_DURATION = 500

export const AudioPlayer: React.FC = () => {
  const dispatch = useDispatch()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<number | null>(null)

  const { stories, currentStoryIndex, isAudioPlaying } = useSelector((state: RootState) => state.story)

  const currentStory = stories[currentStoryIndex]

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

  useEffect(() => {
    const playNewTrack = async () => {
      if (!audioRef.current) return

      if (isAudioPlaying && !audioRef.current.paused) {
        await fadeOut(audioRef.current)
      }

      audioRef.current.load()

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

      try {
        await fadeIn(audioRef.current, 1)
        dispatch(setAudioPlaying(true))
      } catch (error) {
        console.error("Не удалось запустить аудио:", error)
        dispatch(setAudioPlaying(false))
      }
    }

    playNewTrack()

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
    }
  }, [currentStoryIndex, dispatch])

  useEffect(() => {
    if (!audioRef.current) return

    if (isAudioPlaying && audioRef.current.paused) {
      fadeIn(audioRef.current, 1)
    } else if (!isAudioPlaying && !audioRef.current.paused) {
      fadeOut(audioRef.current)
    }
  }, [isAudioPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (currentStoryIndex < stories.length - 1) {
        dispatch(nextStory())
      }
    }

    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentStoryIndex, stories.length, dispatch])

  return <audio ref={audioRef} src={currentStory.audioTrack} preload="auto" />
}
