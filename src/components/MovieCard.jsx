import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Plus, Check, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { useAuthStore } from "../stores/authStore";
import { useWatchlistStore } from "../stores/watchlistStore";
import { posterUrl } from "../services/tmdb";

const PLACEHOLDER =
  "https://via.placeholder.com/300x450/1a1a2e/8b5cf6?text=No+Poster";

export default function MovieCard({ movie, index = 0, showRemove = false }) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const add = useWatchlistStore((s) => s.add);
  const remove = useWatchlistStore((s) => s.remove);
  const isInList = useWatchlistStore((s) => s.isInList(movie.id));

  const poster = posterUrl(movie.poster_path) || PLACEHOLDER;
  const title = movie.title || movie.Title || "Untitled";
  const year = (movie.release_date || movie.Year || "").slice(0, 4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const movieId = movie.id;

  const watchlistItem = {
    id: movieId,
    title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to add movies to your watchlist");
      return;
    }
    add(watchlistItem, user.id);
    toast.success(`"${title}" added to watchlist`);
  };

  const handleRemoveConfirm = () => {
    if (!user) return;
    remove(movieId, user.id);
    toast.success(`"${title}" removed from watchlist`);
    setRemoveOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: reducedMotion ? 0 : 0.4 }}
      >
        <Link to={`/movie/${movieId}`} className="block group">
          <div className="card-glow rounded-xl overflow-hidden glass">
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {year && (
                <Badge className="absolute top-3 right-3 glass text-xs font-medium text-white border-white/20">
                  {year}
                </Badge>
              )}

              {rating && (
                <Badge className="absolute top-3 left-3 bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 text-amber-300 text-xs font-medium">
                  <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                  {rating}
                </Badge>
              )}

              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
                  <Eye className="h-4 w-4" />
                  View Details
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>

              <div
                className="flex gap-2"
                onClick={(e) => e.preventDefault()}
              >
                {showRemove ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRemoveOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                ) : isInList ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    disabled
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Added
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full text-xs"
                    onClick={handleAdd}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Watchlist
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from Watchlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{title}" from your
              watchlist? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveConfirm}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
