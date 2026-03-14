import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ScrollToTop from "./ScrollToTop";
import Navbar from "./Navbar";
import ErrorBoundary from "./ErrorBoundary";
import { Film } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <div className="noise min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      <footer className="border-t border-border/50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
                <Film className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Cineplex</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Your personal movie watchlist. Powered by TMDB API.
            </p>
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} Cineplex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
