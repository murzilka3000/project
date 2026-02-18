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
  mobileSize?: {
    width: number
    height: number
  }
  interaction?:
    | {
        type: "sound" | "navigate" | "replace"
        data: any
      }
    | Array<{
        type: "sound" | "navigate" | "replace"
        data: any
      }>
  zIndex?: number
  noHover?: boolean
}

export interface Story {
  id: number
  title: string
  backgroundImage: string
  audioTrack: string
  objects: InteractiveObject[]
  description?: string
  baseLayer?: string
  toggleBaseLayer?: string
  backgroundEffect?: string
  backgroundSequence?: string[]
  sequenceInterval?: number
}
export interface StoryState {
  stories: Story[]
  currentStoryIndex: number
  isAudioPlaying: boolean
  visitedStories: number[]
  objectInteractions: Record<string, boolean>
}