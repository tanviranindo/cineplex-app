import { create } from 'zustand';

export const useLoginModalStore = create((set) => ({
  isOpen: false,
  pendingMovie: null,
  open: (movie) => set({ isOpen: true, pendingMovie: movie }),
  close: () => set({ isOpen: false, pendingMovie: null }),
}));
