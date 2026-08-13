import { create } from "zustand";

type UiState = {
  isAiOverlayOpen: boolean;
  activeTab: string;
  openAiOverlay: () => void;
  closeAiOverlay: () => void;
  setActiveTab: (tab: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isAiOverlayOpen: false,
  activeTab: "04-dashboard",
  openAiOverlay: () => set({ isAiOverlayOpen: true }),
  closeAiOverlay: () => set({ isAiOverlayOpen: false }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
