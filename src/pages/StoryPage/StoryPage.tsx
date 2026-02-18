import React, { useState } from "react"
import { StorySlide } from "@/features/story/components/StorySlide"
import { AudioPlayer } from "@/features/story/components/AudioPlayer"
import { StartScreen } from "@/features/story/components/StartScreen"
import styles from "./StoryPage.module.scss"

export const StoryPage: React.FC = () => {
  const [showStartScreen, setShowStartScreen] = useState(true)

  return (
    <div className={styles.storyPage}>
      {showStartScreen && <StartScreen onStart={() => setShowStartScreen(false)} />}
      <StorySlide />
      {!showStartScreen && (
        <>
          <AudioPlayer />
        </>
      )}
    </div>
  )
}
