import { create } from "zustand";

type UiStore = {
  quickAddOpen: boolean;
  setQuickAddOpen: (value: boolean) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  quickAddOpen: false,
  setQuickAddOpen: (value) => set({ quickAddOpen: value }),
}));
