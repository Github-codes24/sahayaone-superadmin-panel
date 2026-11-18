import { create } from 'zustand';

const useLoadingStore = create((set) => ({
  requestCount: 0,
  isLoading: false,
  showLoader: () => set((state) => {
    const newCount = state.requestCount + 1;
    return { requestCount: newCount, isLoading: newCount > 0 };
  }),
  hideLoader: () => set((state) => {
    const newCount = Math.max(0, state.requestCount - 1);
    return { requestCount: newCount, isLoading: newCount > 0 };
  }),
  // Optional: forcefully reset loader (e.g. on route change if needed)
  resetLoader: () => set({ requestCount: 0, isLoading: false })
}));

export default useLoadingStore;
