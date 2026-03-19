import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const DEFAULT_THEME = "dark";

export const useThemeStore = create((set, get) => ({
  theme: DEFAULT_THEME,
  _loaded: false,

  setTheme: (theme) => {
    document.documentElement.className = theme;
    set({ theme });
  },

  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
    get().saveToFirestore();
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
    } catch {
      get().setTheme(DEFAULT_THEME);
    }
    set({ _loaded: true });
  },

  saveToFirestore: async () => {
    const uid = get()._uid;
    if (!uid) return;
    try {
      await setDoc(doc(db, "users", uid, "preferences", "theme"), {
        value: get().theme,
      });
    } catch {
      // silent — non-critical preference save
    }
  },

  setUid: (uid) => {
    set({ _uid: uid });
  },

  _uid: null,
}));
