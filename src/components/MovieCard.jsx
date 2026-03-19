import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Plus, Check, Trash2, Eye, Bookmark, CheckCircle, Heart, Film } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuthStore } from "../stores/authStore";
import { useWatchlistStore } from "../stores/watchlistStore";
import { useLoginModalStore } from "../stores/loginModalStore";
import { posterUrl, getMovieById } from "../services/tmdb";
import { queryClient } from "../lib/queryClient";
import { queryKeys } from "../lib/queryKeys";

export default function MovieCard({ movie, index = 0, showRemove = false, addedAt }) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const add = useWatchlistStore((s) => s.add);
  const openLoginModal = useLoginModalStore((s) => s.open);
  const remove = useWatchlistStore((s) => s.remove);
  const isInList = useWatchlistStore((s) => s.isInList(movie.id));
  const setStatus = useWatchlistStore((s) => s.setStatus);
  const currentStatus = useWatchlistStore((s) => s.items.find((m) => m.id === movie.id)?.status ?? null);

  const hasPoster = !!movie.poster_path;
  const title = movie.title || movie.Title || "Untitled";
  const year = (movie.release_date || movie.Year || "").slice(0, 4);
  const hasReliableRating = movie.vote_average > 0 && (movie.vote_count == null || movie.vote_count >= 10);
  const rating = hasReliableRating ? movie.vote_average.toFixed(1) : null;
  const movieId = movie.id;

  const STATUS_OPTIONS = [
    { value: "to_watch", label: "To Watch", icon: Bookmark },
    { value: "watched", label: "Watched", icon: CheckCircle },
    { value: "favorite", label: "Favorite", icon: Heart },
  ];

  const StatusIcon = ({ status }) => {
    const opt = STATUS_OPTIONS.find((o) => o.value === status);
    if (!opt) return <Bookmark className="h-3.5 w-3.5" />;
    return <opt.icon className="h-3.5 w-3.5" />;
  };

  const watchlistItem = {
    id: movieId,
    title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
  };

  const handleMouseEnter = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.movies.detail(movieId),
      queryFn: () => getMovieById(movieId),
      staleTime: 1000 * 60 * 5,
    })
  }, [movieId])

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openLoginModal(watchlistItem);
      return;
    }
    try {
      await add(watchlistItem, user.id);
      toast.success(`"${title}" added to watchlist`);
    } catch {
      toast.error("Failed to update watchlist");
    }
  };

  const handleRemoveConfirm = async () => {
    if (!user) return;
    try {
      await remove(movieId, user.id);
      toast.success(`"${title}" removed from watchlist`);
      setRemoveOpen(false);
    } catch {
      toast.error("Failed to remove from watchlist");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: reducedMotion ? 0 : 0.4 }}
      >
        <Link to={`/movie/${movieId}`} className="block group" onMouseEnter={handleMouseEnter}>
          <div className="card-glow rounded-xl overflow-hidden glass">
            <div className="relative aspect-[2/3] overflow-hidden">
              {hasPoster ? (
                <img
                  src={posterUrl(movie.poster_path)}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling?.classList.remove('hidden') }}
                />
              ) : null}
              <div className={`${hasPoster ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 gap-3`}>
                <Film className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground/60 text-center px-3 leading-tight">{title}</p>
              </div>

              {/* Subtle always-present bottom gradient for readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

              {year && (
                <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-xl border border-white/20 text-white text-xs font-medium">
                  {year}
                </Badge>
              )}

              {rating && (
                <Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                  <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                  {rating}
                </Badge>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white text-sm font-semibold bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Eye className="h-4 w-4" />
                  View Details
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>

              {addedAt && (
                <p className="text-[10px] text-muted-foreground/60">
                  Added {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(addedAt?.toDate?.() ?? new Date(addedAt))}
                </p>
              )}

              <div
                className="flex gap-2"
                onClick={(e) => e.preventDefault()}
              >
                {showRemove ? (
                  <div className="flex gap-1.5 w-full">
                    {/* Status dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 px-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <StatusIcon status={currentStatus} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {STATUS_OPTIONS.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (user) {
                                try {
                                  await setStatus(movieId, user.id, opt.value);
                                } catch {
                                  toast.error("Failed to update watchlist");
                                }
                              }
                            }}
                            className={currentStatus === opt.value ? "bg-accent" : ""}
                          >
                            <opt.icon className="h-4 w-4 mr-2" />
                            {opt.label}
                            {currentStatus === opt.value && (
                              <Check className="h-3.5 w-3.5 ml-auto text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Remove button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRemoveOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
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
