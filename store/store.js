import { create } from 'zustand';

const useRTCStore = create((set, get) => ({
  rtc: {},
  setRTC: (rtc) => set({ rtc }),
  getRTC: () => get().rtc,
}))

export default useRTCStore;


