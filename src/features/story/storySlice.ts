import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { StoryState } from "./types"
import { storiesData } from "./storiesData"

const initialState: StoryState = {
  stories: storiesData,
  currentStoryIndex: 0,
  isAudioPlaying: false,
  visitedStories: [0],
  objectInteractions: {},
}

const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {
    nextStory: (state) => {
      if (state.currentStoryIndex < state.stories.length - 1) {
        state.currentStoryIndex += 1
        if (!state.visitedStories.includes(state.currentStoryIndex)) {
          state.visitedStories.push(state.currentStoryIndex)
        }
      }
    },
    prevStory: (state) => {
      if (state.currentStoryIndex > 0) {
        state.currentStoryIndex -= 1
      }
    },
    goToStory: (state, action: PayloadAction<number>) => {
      const index = action.payload
      if (index >= 0 && index < state.stories.length) {
        state.currentStoryIndex = index
        if (!state.visitedStories.includes(index)) {
          state.visitedStories.push(index)
        }
      }
    },
    toggleAudio: (state) => {
      state.isAudioPlaying = !state.isAudioPlaying
    },
    setAudioPlaying: (state, action: PayloadAction<boolean>) => {
      state.isAudioPlaying = action.payload
    },
    markObjectInteraction: (state, action: PayloadAction<string>) => {
      state.objectInteractions[action.payload] = true
    },
    resetProgress: (state) => {
      state.currentStoryIndex = 0
      state.visitedStories = [0]
      state.objectInteractions = {}
    },
  },
})

export const { nextStory, prevStory, goToStory, toggleAudio, setAudioPlaying, markObjectInteraction, resetProgress } = storySlice.actions

export default storySlice.reducer
