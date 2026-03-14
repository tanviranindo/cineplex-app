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
    if (items.some((m) => m.imdbID === movie.imdbID)) return;
    const next = [
      {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        imdbRating: movie.imdbRating || "N/A",
        Type: movie.Type || "movie",
        addedAt: Date.now(),
      },
      ...items,
    ];
    persist(userId, next);
    set({ items: next });
  },

  remove: (imdbID, userId) => {
    const { items } = get();
    const next = items.filter((m) => m.imdbID !== imdbID);
    persist(userId, next);
    set({ items: next });
  },

  isInList: (imdbID) => {
    return get().items.some((m) => m.imdbID === imdbID);
  },
}));
