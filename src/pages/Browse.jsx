import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Film, AlertTriangle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import { discoverMovies, getGenres } from "../services/tmdb";
import { queryKeys } from "../lib/queryKeys";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { usePageTitle } from "../hooks/usePageTitle";

const SORT_OPTIONS = [
  { value: "popularity.desc",        label: "🔥 Popular" },
  { value: "vote_average.desc",      label: "⭐ Top Rated" },
  { value: "release_date.desc",      label: "🆕 New" },
  { value: "primary_release_date.asc", label: "📅 Upcoming" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Browse() {
  usePageTitle("Browse Movies");
  const [searchParams, setSearchParams] = useSearchParams();

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i),
    [currentYear]
  );

  const genreId = searchParams.get("genre") ? Number(searchParams.get("genre")) : null;
  const sortBy  = searchParams.get("sort")  || "popularity.desc";
  const year    = searchParams.get("year")  ? Number(searchParams.get("year"))  : null;

  const setFilter = useCallback((key, value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value == null) next.delete(key);
        else next.set(key, String(value));
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const filters = { genreId, sortBy, year };

  const { data: genres } = useQuery({
    queryKey: queryKeys.genres,
    queryFn: getGenres,
    staleTime: Infinity,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: queryKeys.browse.infinite(filters),
    queryFn: ({ pageParam = 1 }) => discoverMovies(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const next = allPages.length + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
  });

  const movies = data?.pages.flatMap((p) => p.results) ?? [];
  const total  = data?.pages[0]?.total ?? 0;

  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  );

  const activeSortLabel  = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Popular";
  const activeGenreName  = genres && genreId ? genres[genreId] : null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Ambient orbs */}
      <div className="ambient-orb w-96 h-96 bg-violet-500/10 -top-20 -right-40 animate-float" />
      <div className="ambient-orb w-64 h-64 bg-cyan-500/10 bottom-40 -left-32 animate-float-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Browse <span className="gradient-text">Movies</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore thousands of movies — filter by genre, sort by what matters to you.
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 mb-6 space-y-5"
        >
          {/* Genre chips */}
          {genres && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Genre
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("genre", null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    !genreId
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  All
                </button>
                {Object.entries(genres).map(([id, name]) => (
                  <button
                    key={id}
                    onClick={() =>
                      setFilter("genre", genreId === Number(id) ? null : id)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      genreId === Number(id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort + Year row */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Sort
              </p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter("sort", opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      sortBy === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto">
              <Select
                value={year ? String(year) : "any"}
                onValueChange={(v) => setFilter("year", v === "any" ? null : v)}
              >
                <SelectTrigger className="h-9 w-32 text-xs">
                  <SelectValue placeholder="Any Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Year</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Active filter pills + result count */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {activeGenreName && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {activeGenreName}
              <button
                onClick={() => setFilter("genre", null)}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Clear genre filter"
              >
                ×
              </button>
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">{activeSortLabel}</Badge>
          {year && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {year}
              <button
                onClick={() => setFilter("year", null)}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Clear year filter"
              >
                ×
              </button>
            </Badge>
          )}
          {total > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              {total.toLocaleString()} movie{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">Something went wrong</p>
            <p className="text-muted-foreground mt-1">Please try again later.</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="py-20 text-center">
            <Film className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium">No movies found</p>
            <p className="text-muted-foreground mt-1 text-sm">Try different filters.</p>
          </div>
        ) : (
          <>
            <motion.div
              key={JSON.stringify(filters)}
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            >
              {movies.map((movie) => (
                <motion.div key={movie.id} variants={cardVariant}>
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </motion.div>

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="h-10" />
            {isFetchingNextPage && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
