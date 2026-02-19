export interface InteractiveObject {
  id: string
  gifUrl: string
  position: {
    x: number
    y: number
  }
  mobilePosition?: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  // --- ДОБАВЛЕНО ---
  maxWidth?: string | number // Например "400px" или "50%"
  centered?: boolean // Если true, сдвигает объект на -50% -50% (идеальный центр)
  customClass?: string
  // -----------------
  mobileSize?: {
    width: number
    height: number
  }
  // Добавил | "link" в оба места (для одиночного объекта и для массива)
  interaction?:
    | {
        type: "sound" | "navigate" | "replace" | "link"
        data: any
      }
    | Array<{
        type: "sound" | "navigate" | "replace" | "link"
        data: any
      }>
  zIndex?: number
  noHover?: boolean
}

export interface Story {
  id: number
  title: string
  backgroundImage: string
  audioTrack?: string
  objects: InteractiveObject[]
  description?: string
  baseLayer?: string
  toggleBaseLayer?: string
  backgroundEffect?: string
  backgroundSequence?: string[]
  sequenceInterval?: number
  isBackgroundBottom?: boolean
  backgroundHeight?: string
}

export interface StoryState {
  stories: Story[]
  currentStoryIndex: number
  isAudioPlaying: boolean
  visitedStories: number[]
  objectInteractions: Record<string, boolean>
}
