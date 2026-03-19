import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  AlertTriangle,
  Flame,
  Star,
  CalendarClock,
  CalendarDays,
  SlidersHorizontal,
  Users,
  Clapperboard,
  Globe,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import { discoverMovies, getGenres, searchPeople, profileUrl } from "../services/tmdb";
import { queryKeys } from "../lib/queryKeys";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useDebounce } from "../hooks/useDebounce";
import { usePageTitle } from "../hooks/usePageTitle";

const SORT_OPTIONS = [
  { value: "popularity.desc",          label: "Popular",   icon: Flame },
  { value: "vote_average.desc",        label: "Top Rated", icon: Star },
  { value: "release_date.desc",        label: "New",       icon: CalendarClock },
  { value: "primary_release_date.asc", label: "Upcoming",  icon: CalendarDays },
];

const LANGUAGE_OPTIONS = [
  { value: "", label: "Any Language" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "9", label: "9+ Masterpiece" },
  { value: "8", label: "8+ Excellent" },
  { value: "7", label: "7+ Great" },
  { value: "6", label: "6+ Good" },
  { value: "5", label: "5+ Average" },
];

// Staggered grid animation — cards slide up with spring physics
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function PersonSearch({ label, icon: Icon, onSelect, selectedPerson, onClear }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["people", "search", debouncedQuery],
    queryFn: () => searchPeople(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  // Position the portal-rendered dropdown below the input
  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close if click is outside both the input wrapper and the portal dropdown
      const inWrapper = wrapperRef.current?.contains(e.target);
      const inPortal = e.target.closest?.("[data-person-dropdown]");
      if (!inWrapper && !inPortal) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && debouncedQuery.length >= 2 && dropdownPos;

  if (selectedPerson) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-secondary/50 text-sm">
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {selectedPerson.profilePath && (
          <img
            src={profileUrl(selectedPerson.profilePath)}
            alt=""
            className="w-5 h-5 rounded-full object-cover"
          />
        )}
        <span className="truncate">{selectedPerson.name}</span>
        <button
          onClick={onClear}
          className="ml-auto text-muted-foreground hover:text-foreground"
          aria-label={`Clear ${label}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef}>
      <div className="relative" ref={inputRef}>
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={label}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          className="h-9 pl-9 pr-3 text-xs"
        />
      </div>
      {showDropdown &&
        createPortal(
          <div
            data-person-dropdown
            className="fixed z-[100] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg backdrop-blur-xl overflow-hidden"
            style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, maxHeight: `calc(100vh - ${dropdownPos.top}px - 16px)` }}
          >
            {isLoading ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                No results found
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {results.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => {
                      onSelect(person);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    {person.profilePath ? (
                      <img
                        src={profileUrl(person.profilePath)}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{person.name}</p>
                      <p className="text-[10px] text-muted-foreground">{person.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

export default function Browse() {
  usePageTitle("Browse Movies");
  const [searchParams, setSearchParams] = useSearchParams();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState(null);
  const [selectedDirector, setSelectedDirector] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i),
    [currentYear]
  );

  const genreId   = searchParams.get("genre") ? Number(searchParams.get("genre")) : null;
  const sortBy    = searchParams.get("sort") || "popularity.desc";
  const year      = searchParams.get("year") ? Number(searchParams.get("year")) : null;
  const language  = searchParams.get("lang") || "";
  const ratingGte = searchParams.get("rating") || "";

  const setFilter = useCallback((key, value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value == null || value === "") next.delete(key);
        else next.set(key, String(value));
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
    setSelectedActor(null);
    setSelectedDirector(null);
  }, [setSearchParams]);

  const filters = useMemo(() => ({
    genreId,
    sortBy,
    year,
    language: language || undefined,
    ratingGte: ratingGte || undefined,
    withCast: selectedActor?.id || undefined,
    withCrew: selectedDirector?.id || undefined,
  }), [genreId, sortBy, year, language, ratingGte, selectedActor?.id, selectedDirector?.id]);

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

  const activeSortOption = SORT_OPTIONS.find((o) => o.value === sortBy);
  const activeGenreName  = genres && genreId ? genres[genreId] : null;
  const activeFilterCount = [
    genreId,
    sortBy !== "popularity.desc" ? sortBy : null,
    year,
    language,
    ratingGte,
    selectedActor,
    selectedDirector,
  ].filter(Boolean).length;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="ambient-orb w-96 h-96 bg-violet-500/10 -top-20 -right-40 animate-float" />
      <div className="ambient-orb w-64 h-64 bg-cyan-500/10 bottom-40 -left-32 animate-float-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page header — slides in from left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
              <Clapperboard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Browse <span className="gradient-text">Movies</span>
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Discover by genre, cast, crew, language, and more.
          </p>
        </motion.div>

        {/* Filter bar — scales up from center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          className="glass rounded-2xl p-4 sm:p-5 mb-6 space-y-4"
        >
          {/* Genre chips */}
          {genres && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Film className="h-3 w-3" />
                Genre
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setFilter("genre", null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    !genreId
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
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
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort row */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3 w-3" />
              Sort By
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilter("sort", opt.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      sortBy === opt.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year + Advanced toggle */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" />
                Year
              </p>
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

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs ml-auto"
              onClick={() => setAdvancedOpen((o) => !o)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Advanced
              <ChevronDown className={`h-3 w-3 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence mode="wait">
            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top", overflow: "visible" }}
              >
                <div className="border-t border-border/50 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Language */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Globe className="h-3 w-3" />
                      Language
                    </p>
                    <Select
                      value={language || "any"}
                      onValueChange={(v) => setFilter("lang", v === "any" ? "" : v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Any Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Language</SelectItem>
                        {LANGUAGE_OPTIONS.filter((l) => l.value).map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Star className="h-3 w-3" />
                      Min Rating
                    </p>
                    <Select
                      value={ratingGte || "any"}
                      onValueChange={(v) => setFilter("rating", v === "any" ? "" : v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Rating</SelectItem>
                        {RATING_OPTIONS.filter((r) => r.value).map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actor search */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      Actor
                    </p>
                    <PersonSearch
                      label="Search actor..."
                      icon={Users}
                      selectedPerson={selectedActor}
                      onSelect={setSelectedActor}
                      onClear={() => setSelectedActor(null)}
                    />
                  </div>

                  {/* Director search */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Clapperboard className="h-3 w-3" />
                      Director
                    </p>
                    <PersonSearch
                      label="Search director..."
                      icon={Clapperboard}
                      selectedPerson={selectedDirector}
                      onSelect={setSelectedDirector}
                      onClear={() => setSelectedDirector(null)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active filter pills + result count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          {activeGenreName && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {activeGenreName}
              <button
                onClick={() => setFilter("genre", null)}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Clear genre filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeSortOption && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <activeSortOption.icon className="h-3 w-3" />
              {activeSortOption.label}
            </Badge>
          )}
          {year && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {year}
              <button
                onClick={() => setFilter("year", null)}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Clear year filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {language && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {LANGUAGE_OPTIONS.find((l) => l.value === language)?.label || language}
              <button
                onClick={() => setFilter("lang", "")}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Clear language filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {ratingGte && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {ratingGte}+ Rating
              <button
                onClick={() => setFilter("rating", "")}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Clear rating filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedActor && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {selectedActor.name}
              <button
                onClick={() => setSelectedActor(null)}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Clear actor filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedDirector && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {selectedDirector.name}
              <button
                onClick={() => setSelectedDirector(null)}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Clear director filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilterCount > 1 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          )}
          {total > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              {total.toLocaleString()} movie{total !== 1 ? "s" : ""}
            </span>
          )}
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">Something went wrong</p>
            <p className="text-muted-foreground mt-1">Please try again later.</p>
          </motion.div>
        ) : movies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <Film className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium">No movies found</p>
            <p className="text-muted-foreground mt-1 text-sm">Try different filters.</p>
          </motion.div>
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
