import { Story } from "./types"

export const storiesData: Story[] = [
  {
    id: 1,
    title: "Akiaura Story Ch. 1",
    backgroundImage: "/images/story1/background.png",
    audioTrack: "/audio/background-1.wav",
    description: "",
    objects: [
      {
        id: "smoke",
        gifUrl: "/images/story1/smoke.gif",
        noHover: true,
        position: { x: 0.84, y: 0.6 },
        mobilePosition: { x: 0.84, y: 0.607 },
        size: { width: 0.1, height: 0.09 },
      },
      {
        id: "plant",
        gifUrl: "/images/story1/plant.png",
        position: { x: 0.68, y: 0.3 },
        size: { width: 0.2, height: 0.17 },
        interaction: [
          {
            type: "replace",
            data: {
              replacementGif: "/images/story1/plant-action.gif",
              duration: 1500,
            },
          },
          {
            type: "sound",
            data: {
              soundUrl: "/audio/effects/grass-rustling.mp3",
            },
          },
        ],
      },
      {
        id: "lamp",
        gifUrl: "/images/story1/lamp.png",
        position: { x: 0.26, y: 0.6 },
        size: { width: 0.2, height: 0.14 },
        interaction: [
          {
            type: "sound",
            data: {
              soundUrl: "/audio/effects/lamp-swith.mp3",
            },
          },
          {
            type: "replace",
            data: {
              replacementGif: "/images/story1/lamp-action.gif",
              duration: 1000,
            },
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "",
    backgroundImage: "/images/story2/sky.png",
    audioTrack: "/audio/background-2.mp3",
    description: "",
    baseLayer: "/images/story2/window.png",
    objects: [
      {
        id: "cat",
        gifUrl: "/images/story2/cat-1.png",
        position: { x: 0.55, y: 0.85 },
        size: { width: 0.4, height: 0.17 },
        interaction: [
          {
            type: "replace",
            data: {
              replacementGif: "/images/story2/cat.gif",
              duration: 1500,
            },
          },
          {
            type: "sound",
            data: {
              soundUrl: "/audio/effects/cat-cound.wav",
            },
          },
        ],
      },

      {
        id: "tulle",
        gifUrl: "/images/story2/tulle.gif",
        position: { x: 0.84, y: 0.5 },
        size: { width: 0.5, height: 1 },
        interaction: [
          {
            type: "replace",
            data: {
              replacementGif: "/images/story2/tulle.gif",
              duration: 1500,
            },
          },
          {
            type: "sound",
            data: {
              soundUrl: "/audio/effects/tulle-sound.wav",
            },
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "",
    backgroundImage: "/images/story3/sky.mp4",
    audioTrack: "/audio/background-3.wav",
    baseLayer: "/images/story3/no-sky.png ",
    toggleBaseLayer: "/images/story3/no-sky-3-tiny.png",
    objects: [
      {
        id: "cat",
        gifUrl: "/images/story3/flower-1.png",
        position: { x: 0.7, y: 0.83 },
        size: { width: 0.3, height: 0.17 },
        interaction: [
          {
            type: "replace",
            data: {
              replacementGif: "/images/story3/flowers.gif",
              duration: 1500,
            },
          },
          {
            type: "sound",
            data: {
              soundUrl: "/audio/effects/flowers-sound.mp3",
            },
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "",
    backgroundImage: "/images/story4/background-4.jpg",
    audioTrack: "/audio/background-4.mp3",
    objects: [],
  },
  {
    id: 5,
    title: "",
    backgroundImage: "/images/story5/background-5.jpg",
    audioTrack: "/audio/background-5.mp3",
    objects: [],
  },
  {
    id: 6,
    title: "",
    backgroundImage: "/images/story6/background-6.jpg",
    audioTrack: "/audio/background-6.mp3",
    objects: [],
  },
  {
    id: 7,
    title: "",
    backgroundImage: "/images/story7/background-7.jpg",
    audioTrack: "/audio/background-7.mp3",
    objects: [],
  },
  {
    id: 8,
    title: "",
    backgroundImage: "/images/story8/background-8.jpg",
    audioTrack: "/audio/background-8.mp3",
    description: "The End",
    objects: [],
  },
]
