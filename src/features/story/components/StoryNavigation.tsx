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
  // const currentStory = stories[currentStoryIndex]

  return (
    <div className={styles.navigation}>
      {/* Кнопка звука */}
      <AudioToggle />

      {/* Кнопки навигации */}
      {!isFirst && (
        <button className={`${styles.arrowButton} ${styles.navLeft}`} onClick={() => dispatch(prevStory())}>
          <img src="/images/nav_arrow.svg" alt="Previous" />
        </button>
      )}

      {!isLast && (
        <button className={`${styles.arrowButton} ${styles.navRight}`} onClick={() => dispatch(nextStory())}>
          <img src="/images/nav_arrow.svg" alt="Next" />
        </button>
      )}

      {/* Описание и информация */}
      {/* <div className={`${styles.controls}`}>
        <div className={styles.info}>
          <div className={styles.progress}>
            {currentStoryIndex + 1} / {stories.length}
          </div>
          {currentStory.title && <div className={styles.title}>{currentStory.title}</div>}
          {currentStory.description && <div className={styles.description}>{currentStory.description}</div>}
        </div>
      </div> */}
    </div>
  )
}
