import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/app/store"
import { nextStory, prevStory } from "../storySlice"
import { AudioToggle } from "./AudioToggle"
import styles from "./StoryNavigation.module.scss"

export const StoryNavigation: React.FC = () => {
  const dispatch = useDispatch()
  const { stories, currentStoryIndex } = useSelector((state: RootState) => state.story)

  const isFirst = currentStoryIndex === 0
  const isLast = currentStoryIndex === stories.length - 1

  if (isLast) return null

  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className={styles.navigation} onClick={handleNavClick}>
      <AudioToggle />

      {!isFirst && (
        <button className={`${styles.arrowButton} ${styles.navLeft}`} onClick={() => dispatch(prevStory())}>
          <img src="/images/nav_arrow.svg" alt="Previous" draggable={false} />
        </button>
      )}

      {!isLast && (
        <button className={`${styles.arrowButton} ${styles.navRight}`} onClick={() => dispatch(nextStory())}>
          <img src="/images/nav_arrow.svg" alt="Next" draggable={false} />
        </button>
      )}
    </div>
  )
}
