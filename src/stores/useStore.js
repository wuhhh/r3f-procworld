import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Vector3 } from "three";

// Helper function to get the initial value from local storage
const getLocalStorageValue = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key);
  return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
};

export default create(
  subscribeWithSelector((set, get) => ({
    // General
    mouseIsDown: false,
    setMouseIsDown: value => set(state => ({ mouseIsDown: value })),
    touchIsDown: false,
    setTouchIsDown: value => set(state => ({ touchIsDown: value })),

    // Settings
    hideStory: getLocalStorageValue("hideStory", false),
    toggleHideStory: () => {
      set(state => {
        const newHideStory = !state.hideStory;
        localStorage.setItem("hideStory", JSON.stringify(newHideStory));
        return { hideStory: newHideStory };
      });
    },
    invertY: getLocalStorageValue("invertY", false),
    toggleInvertY: () => {
      set(state => {
        const newInvertY = !state.invertY;
        localStorage.setItem("invertY", JSON.stringify(newInvertY));
        return { invertY: newInvertY };
      });
    },
    muted: getLocalStorageValue("muted", false),
    toggleMuted: () => {
      set(state => {
        const newMuted = !state.muted;
        localStorage.setItem("muted", JSON.stringify(newMuted));
        return { muted: newMuted };
      });
    },

    // Traveller
    keysDown: {
      w: false,
      a: false,
      s: false,
      d: false,
    },
    setKeyDown: (key, value) => set(state => ({ keysDown: { ...state.keysDown, [key]: value } })),
    pitchInertia: 0,
    setPitchInertia: value => set(state => ({ pitchInertia: value })),
    rollInertia: 0,
    setRollInertia: value => set(state => ({ rollInertia: value })),
    yawInertia: 0,
    setYawInertia: value => set(state => ({ yawInertia: value })),
    tPos: new Vector3(),
    setTPos: value => set(state => ({ tPos: value })),
  }))
);
