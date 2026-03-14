import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Film,
  AlertTriangle,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import { searchMovies, getTrendingMovies, getGenres, discoverByGenre } from "../services/tmdb";
import { useDebounce } from "../hooks/useDebounce";
import { usePageTitle } from "../hooks/usePageTitle";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export default function SearchMovies() {
  usePageTitle("Search Movies");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeGenre, setActiveGenre] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQuery("");
        setPage(1);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const debouncedQuery = useDebounce(query, 400);

  const showSearch = debouncedQuery.trim().length >= 2;
  const showGenreDiscover = !showSearch && activeGenre !== null;

  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
  } = useQuery({
    queryKey: ["search", debouncedQuery, page],
    queryFn: () => searchMovies(debouncedQuery, page),
    enabled: showSearch,
    keepPreviousData: true,
  });

  const {
    data: genreData,
    isLoading: genreLoading,
  } = useQuery({
    queryKey: ["discover", activeGenre, page],
    queryFn: () => discoverByGenre(activeGenre, page),
    enabled: showGenreDiscover,
    keepPreviousData: true,
  });

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrendingMovies,
    staleTime: 1000 * 60 * 30,
  });

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: Infinity,
  });

  const activeData = showSearch ? searchData : showGenreDiscover ? genreData : null;
  const activeLoading = showSearch ? searchLoading : showGenreDiscover ? genreLoading : false;
  const totalPages = activeData?.totalPages || 0;

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleGenreClick = (genreId) => {
    setActiveGenre((prev) => (prev === genreId ? null : genreId));
    setPage(1);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Ambient orbs */}
      <div className="ambient-orb w-80 h-80 bg-violet-500/10 -top-20 -right-40 animate-float" />
      <div className="ambient-orb w-64 h-64 bg-cyan-500/10 bottom-40 -left-32 animate-float-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            <span className="gradient-text">Discover Movies</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Search from a massive database of movies, TV shows, and more.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <div className="relative search-glow rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search movies by title..."
              value={query}
              onChange={handleQueryChange}
              className="h-14 pl-12 pr-12 text-lg rounded-xl border-white/10 bg-card"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-2">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">
              /
            </kbd>{" "}
            to search
          </p>

          {/* Genre chips */}
          {genres && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {Object.entries(genres).map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => handleGenreClick(Number(id))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeGenre === Number(id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Search / Genre results */}
        {showSearch || showGenreDiscover ? (
          <div>
            {activeLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : searchError ? (
              <div className="py-20 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-medium">Something went wrong</p>
                <p className="text-muted-foreground mt-1">
                  Please try again later.
                </p>
              </div>
            ) : activeData && activeData.results.length > 0 ? (
              <>
                {/* Result count */}
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {activeData.total} result{activeData.total !== 1 ? "s" : ""}{" "}
                    found
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </div>

                {/* Grid */}
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  key={`${debouncedQuery}-${activeGenre}-${page}`}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                >
                  {activeData.results.map((movie, i) => (
                    <MovieCard key={movie.id} movie={movie} index={i} />
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-10">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="glass rounded-full px-4 py-2 text-sm font-medium">
                      {page} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <Film className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg font-medium">No movies found</p>
                <p className="text-muted-foreground mt-1">
                  Try a different search term.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Featured movies */
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-6">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
              <h2 className="text-xl font-semibold">Trending This Week</h2>
            </div>

            {featuredLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : featured && featured.length > 0 ? (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
              >
                {featured.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} />
                ))}
              </motion.div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
