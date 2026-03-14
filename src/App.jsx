import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PageSkeleton from "./components/PageSkeleton";
import LoginModal from "./components/LoginModal";
import { useAuthStore } from "./stores/authStore";
import { useWatchlistStore } from "./stores/watchlistStore";
import { useThemeStore } from "./stores/themeStore";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const SearchMovies = lazy(() => import("./pages/SearchMovies"));
const MovieDetail = lazy(() => import("./pages/MovieDetail"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Account = lazy(() => import("./pages/Account"));

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const subscribe = useWatchlistStore((s) => s.subscribe);
  const unsubscribeAll = useWatchlistStore((s) => s.unsubscribeAll);

  // Apply theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsub = initAuth();
    return unsub;
  }, []);

  // Subscribe/unsubscribe watchlist based on auth state
  useEffect(() => {
    if (user?.id) subscribe(user.id);
    else unsubscribeAll();
  }, [user?.id]);

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
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
      <LoginModal />
    </BrowserRouter>
  );
}
