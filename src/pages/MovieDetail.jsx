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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { getMovieById } from "../services/omdb";
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
  const isInList = useWatchlistStore((s) => s.isInList(id));

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieById(id),
  });

  const handleAdd = () => {
    if (!user) {
      toast.error("Please sign in to add movies to your watchlist");
      return;
    }
    add(movie, user.id);
    toast.success(`"${movie.Title}" added to watchlist`);
  };

  const handleRemove = () => {
    if (!user) return;
    remove(movie.imdbID, user.id);
    toast.success(`"${movie.Title}" removed from watchlist`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Spinner />
      </div>
    );
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

  const poster =
    movie.Poster && movie.Poster !== "N/A" ? movie.Poster : PLACEHOLDER;
  const genres = movie.Genre ? movie.Genre.split(", ") : [];
  const ratings = movie.Ratings || [];

  const credits = [
    { label: "Director", value: movie.Director },
    { label: "Cast", value: movie.Actors },
    { label: "Release Date", value: movie.Released },
    { label: "Box Office", value: movie.BoxOffice },
  ].filter((c) => c.value && c.value !== "N/A");

  return (
    <div className="relative">
      {/* Blurred poster background */}
      <div className="absolute inset-x-0 top-0 h-56 overflow-hidden">
        <img
          src={poster}
          alt=""
          className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
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
                alt={movie.Title}
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
                {movie.Title}
              </h1>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {movie.Year && movie.Year !== "N/A" && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {movie.Year}
                  </Badge>
                )}
                {movie.Runtime && movie.Runtime !== "N/A" && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {movie.Runtime}
                  </Badge>
                )}
                {movie.Rated && movie.Rated !== "N/A" && (
                  <Badge variant="outline">{movie.Rated}</Badge>
                )}
                {movie.imdbRating && movie.imdbRating !== "N/A" && (
                  <Badge className="bg-amber-500/20 border-amber-400/30 text-amber-300 gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {movie.imdbRating}/10
                  </Badge>
                )}
              </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Plot */}
            {movie.Plot && movie.Plot !== "N/A" && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Plot
                </h3>
                <p className="text-sm leading-relaxed">{movie.Plot}</p>
              </div>
            )}

            {/* Ratings */}
            {ratings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Ratings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ratings.map((r) => (
                    <div key={r.Source} className="glass rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {r.Source}
                      </p>
                      <p className="text-xl font-bold gradient-text">
                        {r.Value}
                      </p>
                    </div>
                  ))}
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
              {isInList ? (
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
