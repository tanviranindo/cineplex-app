import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  X,
  Sparkles,
  Film,
  AlertTriangle,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import { searchMovies, getTrendingMovies, getGenres, discoverByGenre, backdropUrl } from "../services/tmdb";
import { useDebounce } from "../hooks/useDebounce";
import { usePageTitle } from "../hooks/usePageTitle";
import { queryKeys } from "../lib/queryKeys";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

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
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: fetchingNextSearch,
    isLoading: searchLoading,
    isError: searchError,
  } = useInfiniteQuery({
    queryKey: queryKeys.search.infinite(debouncedQuery),
    queryFn: ({ pageParam = 1 }) => searchMovies(debouncedQuery, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const next = allPages.length + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    enabled: showSearch,
  });

  const {
    data: genreData,
    fetchNextPage: fetchNextGenre,
    hasNextPage: hasNextGenre,
    isFetchingNextPage: fetchingNextGenre,
    isLoading: genreLoading,
  } = useInfiniteQuery({
    queryKey: queryKeys.discover.infinite(activeGenre),
    queryFn: ({ pageParam = 1 }) => discoverByGenre(activeGenre, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const next = allPages.length + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    enabled: showGenreDiscover,
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

  const searchMoviesList = searchData?.pages.flatMap((p) => p.results) ?? [];
  const searchTotal = searchData?.pages[0]?.total ?? 0;
  const genreMoviesList = genreData?.pages.flatMap((p) => p.results) ?? [];
  const genreTotal = genreData?.pages[0]?.total ?? 0;

  const activeMoviesList = showSearch ? searchMoviesList : showGenreDiscover ? genreMoviesList : [];
  const activeTotal = showSearch ? searchTotal : showGenreDiscover ? genreTotal : 0;
  const activeLoading = showSearch ? searchLoading : showGenreDiscover ? genreLoading : false;
  const activeError = showSearch ? searchError : false;

  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (showSearch && hasNextSearch && !fetchingNextSearch) fetchNextSearch();
      if (showGenreDiscover && hasNextGenre && !fetchingNextGenre) fetchNextGenre();
    }, [showSearch, hasNextSearch, fetchingNextSearch, fetchNextSearch,
        showGenreDiscover, hasNextGenre, fetchingNextGenre, fetchNextGenre])
  );

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    // no setPage needed
  };

  const handleGenreClick = (genreId) => {
    if (query.length > 0) setQuery("");
    setActiveGenre((prev) => (prev === genreId ? null : genreId));
    // no setPage needed
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
          className="relative text-center mb-10 rounded-2xl overflow-hidden glass py-12 px-6"
        >
          {featured?.[0]?.backdrop_path && (
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={backdropUrl(featured[0].backdrop_path)}
                alt=""
                className="w-full h-full object-cover blur-sm opacity-10 scale-110"
                loading="lazy"
              />
            </div>
          )}
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              <span className="gradient-text">Discover Movies</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Search thousands of movies and build your watchlist.
            </p>
          </div>
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
                }}
                aria-label="Clear search"
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
            <>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {Object.entries(genres).map(([id, name]) => (
                  <button
                    key={id}
                    onClick={() => handleGenreClick(Number(id))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      showSearch
                        ? "opacity-40 cursor-pointer"
                        : activeGenre === Number(id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {showSearch && (
                <p className="text-center text-xs text-muted-foreground/50 mt-2">
                  Genre filter applies when search is empty
                </p>
              )}
            </>
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
            ) : activeError ? (
              <div className="py-20 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-medium">Something went wrong</p>
                <p className="text-muted-foreground mt-1">
                  Please try again later.
                </p>
              </div>
            ) : activeMoviesList.length > 0 ? (
              <>
                {/* Result count */}
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {activeTotal} result{activeTotal !== 1 ? "s" : ""}{" "}
                    found
                  </Badge>
                </div>

                {/* Grid */}
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  key={`${debouncedQuery}-${activeGenre}`}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                >
                  {activeMoviesList.map((movie, i) => (
                    <MovieCard key={movie.id} movie={movie} index={i} />
                  ))}
                </motion.div>

                {/* Infinite scroll sentinel */}
                <div ref={loadMoreRef} className="h-10" />
                {(fetchingNextSearch || fetchingNextGenre) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mt-4">
                    {Array.from({ length: 5 }).map((_, i) => <MovieCardSkeleton key={i} />)}
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
