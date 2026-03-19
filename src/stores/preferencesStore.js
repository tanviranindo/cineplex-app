import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const DEFAULTS = {
  watchlistTab: "all",
  watchlistSort: "added",
  searchHistory: [],
  recentlyViewed: [],
};

const PREFS_PATH = (uid) => doc(db, "users", uid, "preferences", "settings");
const MAX_SEARCH_HISTORY = 10;
const MAX_RECENTLY_VIEWED = 20;

export const usePreferencesStore = create((set, get) => ({
  ...DEFAULTS,
  _uid: null,
  _loaded: false,

  load: async (uid) => {
    if (!uid) {
      set({ ...DEFAULTS, _uid: null, _loaded: true });
      return;
    }
    set({ _uid: uid });
    try {
      const snap = await getDoc(PREFS_PATH(uid));
      if (snap.exists()) {
        const data = snap.data();
        set({
          watchlistTab: data.watchlistTab ?? DEFAULTS.watchlistTab,
          watchlistSort: data.watchlistSort ?? DEFAULTS.watchlistSort,
          searchHistory: data.searchHistory ?? DEFAULTS.searchHistory,
          recentlyViewed: data.recentlyViewed ?? DEFAULTS.recentlyViewed,
          _loaded: true,
        });
      } else {
        set({ ...DEFAULTS, _uid: uid, _loaded: true });
      }
    } catch (e) {
      console.warn("[preferences] Failed to load:", e.message);
      set({ ...DEFAULTS, _uid: uid, _loaded: true });
    }
  },

  _save: async () => {
    const { _uid, watchlistTab, watchlistSort, searchHistory, recentlyViewed } = get();
    if (!_uid) return;
    try {
      await setDoc(PREFS_PATH(_uid), {
        watchlistTab,
        watchlistSort,
        searchHistory,
        recentlyViewed,
      }, { merge: true });
    } catch (e) {
      console.warn("[preferences] Failed to save:", e.message);
    }
  },

  setWatchlistTab: (tab) => {
    set({ watchlistTab: tab });
    get()._save();
  },

  setWatchlistSort: (sort) => {
    set({ watchlistSort: sort });
    get()._save();
  },

  addSearchQuery: (query) => {
    if (!get()._uid) return;
    const trimmed = query.trim();
    if (!trimmed) return;
    const prev = get().searchHistory.filter((q) => q !== trimmed);
    const next = [trimmed, ...prev].slice(0, MAX_SEARCH_HISTORY);
    set({ searchHistory: next });
    get()._save();
  },

  removeSearchQuery: (query) => {
    set({ searchHistory: get().searchHistory.filter((q) => q !== query) });
    get()._save();
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
    get()._save();
  },

  addRecentlyViewed: (movie) => {
    if (!get()._uid) return;
    const entry = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path ?? null,
      vote_average: movie.vote_average ?? 0,
      release_date: movie.release_date ?? "",
      viewedAt: Date.now(),
    };
    const prev = get().recentlyViewed.filter((m) => m.id !== movie.id);
    const next = [entry, ...prev].slice(0, MAX_RECENTLY_VIEWED);
    set({ recentlyViewed: next });
    get()._save();
  },
}));
