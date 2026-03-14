import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Film,
  Plus,
  Check,
  Trash2,
  Search,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import MovieDetailSkeleton from "../components/MovieDetailSkeleton";
import { getMovieById, posterUrl, backdropUrl } from "../services/tmdb";
import { usePageTitle } from "../hooks/usePageTitle";
import { useAuthStore } from "../stores/authStore";
import { useWatchlistStore } from "../stores/watchlistStore";

const PLACEHOLDER =
  "https://via.placeholder.com/300x450/1a1a2e/8b5cf6?text=No+Poster";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const add = useWatchlistStore((s) => s.add);
  const remove = useWatchlistStore((s) => s.remove);
  const movieId = parseInt(id, 10);
  const isInList = useWatchlistStore((s) => s.isInList(movieId));

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieById(id),
  });

  usePageTitle(movie?.title);

  const handleAdd = () => {
    if (!user) {
      toast.error("Please sign in to add movies to your watchlist");
      return;
    }
    add({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
    }, user.id);
    toast.success(`"${movie.title}" added to watchlist`);
  };

  const handleRemove = () => {
    if (!user) return;
    remove(movie.id, user.id);
    toast.success(`"${movie.title}" removed from watchlist`);
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
  const year = movie.release_date?.slice(0, 4);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
  const revenue = movie.revenue ? `$${(movie.revenue / 1_000_000).toFixed(0)}M` : null;
  const budget = movie.budget ? `$${(movie.budget / 1_000_000).toFixed(0)}M` : null;

  const credits = [
    { label: "Director", value: movie.directors?.join(", ") },
    { label: "Cast", value: movie.cast?.join(", ") },
    { label: "Release Date", value: movie.release_date },
    { label: "Revenue", value: revenue },
    { label: "Budget", value: budget },
    { label: "Status", value: movie.status },
  ].filter((c) => c.value);

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

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="shrink-0 mx-auto md:mx-0"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-violet-500/20 rounded-3xl blur-3xl" />
              <img
                src={poster}
                alt={movie.title}
                className="relative w-64 sm:w-72 rounded-2xl shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                  <Badge className="bg-amber-500/20 border-amber-400/30 text-amber-300 gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
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

            {/* Credits */}
            {credits.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {credits.map((c) => (
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
    </div>
  );
}
