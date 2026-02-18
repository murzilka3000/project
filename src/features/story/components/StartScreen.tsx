import React from "react"
import styles from "./StartScreen.module.scss"

interface Props {
  onStart: () => void
}

export const StartScreen: React.FC<Props> = ({ onStart }) => {
  return (
    <div className={styles.startScreen} onClick={onStart}>
      <div className={styles.content}>
        <h1 className={styles.title}>Akiaura</h1>
        <p className={styles.subtitle}>Touch anywhere to start</p>
        <div className={styles.hint}>
          <img className={styles.clickIcon} src="/images/sound_on.svg" />
        </div>
      </div>
    </div>
  )
}
