import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Star, Clock, Calendar, Film, Plus, Play, Trash2, Search,
  ExternalLink, Bookmark, CheckCircle, Heart, Check, Users, Clapperboard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "../components/ui/dialog";
import MovieDetailSkeleton from "../components/MovieDetailSkeleton";
import MovieCard from "../components/MovieCard";
import { getMovieById, getSimilarMovies, getWatchProviders, posterUrl, backdropUrl, profileUrl } from "../services/tmdb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { usePageTitle } from "../hooks/usePageTitle";
import { useAuthStore } from "../stores/authStore";
import { useWatchlistStore } from "../stores/watchlistStore";
import { usePreferencesStore } from "../stores/preferencesStore";
import { queryKeys } from "../lib/queryKeys";

const PLACEHOLDER =
  "https://via.placeholder.com/300x450/1a1a2e/8b5cf6?text=No+Poster";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const add = useWatchlistStore((s) => s.add);
  const remove = useWatchlistStore((s) => s.remove);
  const movieId = parseInt(id, 10);
  const isInList = useWatchlistStore((s) => s.isInList(movieId));
  const setStatus = useWatchlistStore((s) => s.setStatus);
  // Use direct items selector (not s.getItemStatus) so the component re-renders when status changes
  const currentStatus = useWatchlistStore((s) => s.items.find((m) => m.id === movieId)?.status ?? null);

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: queryKeys.movies.detail(id),
    queryFn: () => getMovieById(id),
  });

  const { data: similar } = useQuery({
    queryKey: queryKeys.movies.similar(id),
    queryFn: () => getSimilarMovies(id),
    enabled: !!movie,
  });

  const { data: providers } = useQuery({
    queryKey: queryKeys.movies.providers(id),
    queryFn: () => getWatchProviders(id),
    enabled: !!movie,
    staleTime: 1000 * 60 * 60,
  });

  usePageTitle(movie?.title);

  const addRecentlyViewed = usePreferencesStore((s) => s.addRecentlyViewed);
  useEffect(() => {
    if (movie) addRecentlyViewed(movie);
  }, [movie?.id]);

  const handleAdd = async () => {
    if (!user) {
      toast.error("Please sign in to add movies to your watchlist");
      return;
    }
    try {
      await add({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      }, user.id);
      toast.success(`"${movie.title}" added to watchlist`);
    } catch {
      toast.error("Failed to update watchlist");
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    try {
      await remove(movie.id, user.id);
      toast.success(`"${movie.title}" removed from watchlist`);
    } catch {
      toast.error("Failed to remove from watchlist");
    }
  };

  if (isLoading) {
    return <MovieDetailSkeleton />;
  }

  if (isError || !movie) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <Film className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-xl font-medium">Movie not found</p>
        <Button variant="outline" onClick={() => navigate("/search")}>
          Back to Search
        </Button>
      </div>
    );
  }

  const poster = posterUrl(movie.poster_path) || PLACEHOLDER;
  const backdrop = backdropUrl(movie.backdrop_path);
  const genres = movie.genres || [];
  const trailer = movie.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const year = movie.release_date?.slice(0, 4);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
  const revenue = movie.revenue ? `$${(movie.revenue / 1_000_000).toFixed(0)}M` : null;
  const budget = movie.budget ? `$${(movie.budget / 1_000_000).toFixed(0)}M` : null;

  const infoCredits = [
    { label: "Release Date", value: movie.release_date },
    { label: "Revenue", value: revenue },
    { label: "Budget", value: budget },
    { label: "Status", value: movie.status },
  ].filter((c) => c.value);

  const STATUS_OPTIONS = [
    { value: "to_watch", label: "To Watch", icon: Bookmark },
    { value: "watched", label: "Watched", icon: CheckCircle },
    { value: "favorite", label: "Favorite", icon: Heart },
  ];

  return (
    <div className="relative">
      {/* Blurred backdrop background */}
      <div className="absolute inset-x-0 top-0 h-72 overflow-hidden">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            className="w-full h-full object-cover blur-sm opacity-20 scale-105"
          />
        ) : (
          <img
            src={poster}
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 mx-auto md:mx-0"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-violet-500/20 rounded-3xl blur-3xl" />
              <img
                src={poster}
                alt={movie.title}
                fetchPriority="high"
                className="relative w-64 sm:w-72 rounded-2xl shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 space-y-6"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-muted-foreground mt-1 italic">"{movie.tagline}"</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {year && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {year}
                  </Badge>
                )}
                {runtime && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {runtime}
                  </Badge>
                )}
                {movie.vote_average > 0 && (
                  <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300 gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                    {movie.vote_average.toFixed(1)}/10
                  </Badge>
                )}
                {movie.vote_count > 0 && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {movie.vote_count.toLocaleString()} votes
                  </Badge>
                )}
              </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge key={genre.id} variant="outline" className="rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Overview
                </h3>
                <p className="text-sm leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {/* Streaming Providers — fully inline */}
            {providers && (providers.stream.length > 0 || providers.rent.length > 0 || providers.buy.length > 0) && (
              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
                    <Play className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Where to Watch
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Stream", items: providers.stream, color: "from-green-500 to-emerald-600" },
                    { label: "Rent", items: providers.rent, color: "from-blue-500 to-indigo-600" },
                    { label: "Buy", items: providers.buy, color: "from-amber-500 to-orange-600" },
                  ]
                    .filter((g) => g.items.length > 0)
                    .map((group) => (
                      <div key={group.label}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r ${group.color}`} />
                          <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map((p) => (
                            <div
                              key={p.provider_id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition-colors"
                            >
                              <img
                                src={posterUrl(p.logo_path, "w92")}
                                alt={p.provider_name}
                                className="w-6 h-6 rounded-md object-cover"
                              />
                              <span className="text-xs font-medium">{p.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
                {providers.link && (
                  <p className="text-[10px] text-muted-foreground/50 mt-4 pt-3 border-t border-border/30">
                    Availability data provided by JustWatch
                  </p>
                )}
              </div>
            )}

            {/* Rating visual */}
            {movie.vote_average > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Rating
                </h3>
                <div className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="text-3xl font-bold gradient-text">
                    {movie.vote_average.toFixed(1)}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                        style={{ width: `${(movie.vote_average / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {movie.vote_count.toLocaleString()} reviews
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Director(s) */}
            {movie.directorsDetailed?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clapperboard className="h-3 w-3" />
                  Director{movie.directorsDetailed.length > 1 ? "s" : ""}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.directorsDetailed.map((d) => (
                    <Link
                      key={d.id}
                      to={`/person/${d.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition-colors group"
                    >
                      {d.profilePath ? (
                        <img
                          src={profileUrl(d.profilePath)}
                          alt={d.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <Clapperboard className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {d.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Cast */}
            {movie.castDetailed?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  Cast
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
                  {movie.castDetailed.map((c) => (
                    <Link
                      key={c.id}
                      to={`/person/${c.id}`}
                      className="flex flex-col items-center gap-1.5 shrink-0 w-20 group"
                    >
                      {c.profilePath ? (
                        <img
                          src={profileUrl(c.profilePath)}
                          alt={c.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-[11px] font-medium text-center leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {c.name}
                      </span>
                      {c.character && (
                        <span className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-1">
                          {c.character}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            {infoCredits.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {infoCredits.map((c) => (
                  <div key={c.label}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      {c.label}
                    </h4>
                    <p className="text-sm">{c.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {user && (
                isInList ? (
                  <Button
                    variant="destructive"
                    className="shadow-lg shadow-destructive/25"
                    onClick={handleRemove}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove from Watchlist
                  </Button>
                ) : (
                  <Button
                    className="shadow-lg shadow-primary/25"
                    onClick={handleAdd}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Watchlist
                  </Button>
                )
              )}
              {user && isInList && (() => {
                const opt = STATUS_OPTIONS.find((o) => o.value === currentStatus);
                const Icon = opt?.icon || Bookmark;
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {opt?.label || "To Watch"}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {STATUS_OPTIONS.map((o) => (
                        <DropdownMenuItem
                          key={o.value}
                          onClick={async () => {
                            try {
                              await setStatus(movieId, user.id, o.value);
                            } catch {
                              toast.error("Failed to update watchlist");
                            }
                          }}
                          className={currentStatus === o.value ? "bg-accent" : ""}
                        >
                          <o.icon className="h-4 w-4 mr-2" />
                          {o.label}
                          {currentStatus === o.value && (
                            <Check className="h-3.5 w-3.5 ml-auto text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })()}
              {trailer && (
                <Button variant="outline" onClick={() => setTrailerOpen(true)}>
                  <Play className="h-4 w-4 mr-2" />
                  Watch Trailer
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/search">
                  <Search className="h-4 w-4 mr-2" />
                  Back to Search
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {similar?.length > 0 && (
        <div className="mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-xl font-bold mb-6"
          >
            You Might Also Like
          </motion.h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:overflow-visible sm:pb-0">
            {similar.map((m, i) => (
              <div key={m.id} className="shrink-0 w-36 sm:w-auto snap-start">
                <MovieCard movie={m} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}

      {trailer && (
        <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`${movie.title} Trailer`}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
