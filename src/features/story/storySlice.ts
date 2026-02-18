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
    // Переход к следующему слайду
    nextStory: (state) => {
      if (state.currentStoryIndex < state.stories.length - 1) {
        state.currentStoryIndex += 1
        // Добавляем в список посещенных, если еще не был там
        if (!state.visitedStories.includes(state.currentStoryIndex)) {
          state.visitedStories.push(state.currentStoryIndex)
        }
      }
    },
    // Переход к предыдущему слайду
    prevStory: (state) => {
      if (state.currentStoryIndex > 0) {
        state.currentStoryIndex -= 1
      }
    },
    // Прямой переход к слайду (например, из оглавления)
    goToStory: (state, action: PayloadAction<number>) => {
      const index = action.payload
      if (index >= 0 && index < state.stories.length) {
        state.currentStoryIndex = index
        if (!state.visitedStories.includes(index)) {
          state.visitedStories.push(index)
        }
      }
    },
    // Переключатель звука (Вкл/Выкл)
    toggleAudio: (state) => {
      state.isAudioPlaying = !state.isAudioPlaying
    },
    // Установка конкретного состояния звука
    setAudioPlaying: (state, action: PayloadAction<boolean>) => {
      state.isAudioPlaying = action.payload
    },
    // Пометка, что пользователь кликнул на интерактивный объект
    // Изменил тип на string | number для универсальности
    markObjectInteraction: (state, action: PayloadAction<string | number>) => {
      state.objectInteractions[String(action.payload)] = true
    },
    // Полный сброс прогресса (для кнопки "Начать заново")
    resetProgress: (state) => {
      state.currentStoryIndex = 0
      state.visitedStories = [0]
      state.objectInteractions = {}
      state.isAudioPlaying = false // При сбросе лучше выключать аудио
    },
  },
})

export const { nextStory, prevStory, goToStory, toggleAudio, setAudioPlaying, markObjectInteraction, resetProgress } = storySlice.actions

export default storySlice.reducer
