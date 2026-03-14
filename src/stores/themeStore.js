import { create } from "zustand";

function getInitialTheme() {
  try {
    return localStorage.getItem("cineplex_theme") || "dark";
  } catch {
    return "dark";
  }
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    localStorage.setItem("cineplex_theme", theme);
    document.documentElement.className = theme;
    set({ theme });
  },

  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));
