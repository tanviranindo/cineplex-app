import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PageSkeleton from "./components/PageSkeleton";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const SearchMovies = lazy(() => import("./pages/SearchMovies"));
const MovieDetail = lazy(() => import("./pages/MovieDetail"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
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
      <Suspense fallback={<PageSkeleton />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
