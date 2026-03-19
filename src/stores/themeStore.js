import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const DEFAULT_THEME = "dark";

export const useThemeStore = create((set, get) => ({
  theme: DEFAULT_THEME,
  _loaded: false,
  _uid: null,

  setTheme: (theme) => {
    document.documentElement.className = theme;
    set({ theme });
  },

  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
    get()._saveTheme();
  },

  loadFromFirestore: async (uid) => {
    if (!uid) {
      get().setTheme(DEFAULT_THEME);
      set({ _loaded: true });
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", uid, "preferences", "theme"));
      const saved = snap.exists() ? snap.data().value : DEFAULT_THEME;
      get().setTheme(saved);
    } catch (e) {
      console.warn("[theme] Failed to load from Firestore:", e.message);
      get().setTheme(DEFAULT_THEME);
    }
    set({ _loaded: true });
  },

  _saveTheme: async () => {
    const uid = get()._uid;
    if (!uid) return;
    try {
      await setDoc(doc(db, "users", uid, "preferences", "theme"), {
        value: get().theme,
      });
    } catch (e) {
      console.warn("[theme] Failed to save to Firestore:", e.message);
    }
  },

  setUid: (uid) => {
    set({ _uid: uid });
  },
}));
