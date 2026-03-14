import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Plus, Search, ArrowUpDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import MovieCard from "../components/MovieCard";
import { useWatchlistStore } from "../stores/watchlistStore";
import { usePageTitle } from "../hooks/usePageTitle";

const TAB_STATUS = {
  all: null,
  to_watch: "to_watch",
  watched: "watched",
  favorite: "favorite",
};

const TAB_LABELS = {
  all: "All",
  to_watch: "To Watch",
  watched: "Watched",
  favorite: "Favorites",
};

function sortItems(items, sortBy) {
  const sorted = [...items];
  switch (sortBy) {
    case "title":
      return sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    case "rating":
      return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    case "year":
      return sorted.sort((a, b) => {
        const ya = (a.release_date || "").slice(0, 4);
        const yb = (b.release_date || "").slice(0, 4);
        return yb.localeCompare(ya);
      });
    case "added":
    default: {
      const toMs = (v) => {
        if (!v) return 0
        if (typeof v === 'number') return v
        if (typeof v.toMillis === 'function') return v.toMillis()
        return 0
      }
      return sorted.sort((a, b) => toMs(b.addedAt) - toMs(a.addedAt))
    }
  }
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export default function Watchlist() {
  usePageTitle("My Watchlist");
  const items = useWatchlistStore((s) => s.items);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("added");

  // Global empty state
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Film className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-8">
            Start adding movies to keep track of what you want to watch next.
          </p>
          <Button size="lg" className="rounded-full" asChild>
            <Link to="/search">
              <Search className="h-4 w-4 mr-2" />
              Browse Movies
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  // Per-tab counts (always from full items list)
  const counts = {
    all: items.length,
    to_watch: items.filter((m) => m.status === "to_watch" || !m.status).length,
    watched: items.filter((m) => m.status === "watched").length,
    favorite: items.filter((m) => m.status === "favorite").length,
  };

  // Filtered + sorted items
  const filtered =
    activeTab === "all"
      ? items
      : items.filter((m) => {
          if (activeTab === "to_watch") return m.status === "to_watch" || !m.status;
          return m.status === TAB_STATUS[activeTab];
        });
  const displayed = sortItems(filtered, sortBy);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="ambient-orb w-80 h-80 bg-violet-500/10 -top-20 -right-40 animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              My Watchlist
            </h1>
            <Badge variant="secondary" className="text-sm">
              {items.length} movie{items.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="added">Date Added (newest first)</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
                <SelectItem value="rating">Rating (highest first)</SelectItem>
                <SelectItem value="year">Year (newest first)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-full w-fit" asChild>
              <Link to="/search">
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="glass">
            {Object.keys(TAB_LABELS).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="gap-1.5">
                {TAB_LABELS[tab]}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {counts[tab]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filter-empty state */}
        {displayed.length === 0 ? (
          <div className="py-20 text-center">
            <Film className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium">No {TAB_LABELS[activeTab].toLowerCase()} movies yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {activeTab === "favorite"
                ? "Mark movies as favorites from your watchlist."
                : activeTab === "watched"
                ? "Mark movies as watched to track your progress."
                : "Add movies to your watchlist to see them here."}
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            key={activeTab}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
          >
            {displayed.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                showRemove
                addedAt={movie.addedAt}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
