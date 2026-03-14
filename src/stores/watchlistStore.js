import { create } from "zustand";

function getKey(userId) {
  return `cineplex_watchlist_${userId}`;
}

function loadItems(userId) {
  try {
    const raw = localStorage.getItem(getKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(userId, items) {
  localStorage.setItem(getKey(userId), JSON.stringify(items));
}

export const useWatchlistStore = create((set, get) => ({
  items: [],

  hydrate: (userId) => {
    if (!userId) {
      set({ items: [] });
      return;
    }
    set({ items: loadItems(userId) });
  },

  add: (movie, userId) => {
    const { items } = get();
    if (items.some((m) => m.id === movie.id)) return;
    const next = [
      {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        addedAt: Date.now(),
      },
      ...items,
    ];
    persist(userId, next);
    set({ items: next });
  },

  remove: (movieId, userId) => {
    const { items } = get();
    const next = items.filter((m) => m.id !== movieId);
    persist(userId, next);
    set({ items: next });
  },

  isInList: (movieId) => {
    return get().items.some((m) => m.id === movieId);
  },
}));
