import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SearchMovies from "./pages/SearchMovies";
import MovieDetail from "./pages/MovieDetail";
import Watchlist from "./pages/Watchlist";
import { useAuthStore } from "./stores/authStore";
import { useWatchlistStore } from "./stores/watchlistStore";
import { useThemeStore } from "./stores/themeStore";

export default function App() {
  const user = useAuthStore((s) => s.user);
  const hydrate = useWatchlistStore((s) => s.hydrate);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Apply theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Hydrate watchlist when user changes
  useEffect(() => {
    hydrate(user?.id || null);
  }, [user?.id, hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchMovies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
