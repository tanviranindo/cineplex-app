import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Play, UserPlus, TrendingUp, ChevronRight, Search, Star, BookmarkCheck, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import { useAuthStore } from "../stores/authStore";
import { usePreferencesStore } from "../stores/preferencesStore";
import { usePageTitle } from "../hooks/usePageTitle";
import { getTrendingMovies, backdropUrl, posterUrl } from "../services/tmdb";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Browse millions of movies from the TMDB database with instant, real-time search.",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description: "See TMDB community ratings, vote counts, and detailed movie statistics.",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    icon: BookmarkCheck,
    title: "Personal Watchlist",
    description: "Save your favorites, track watched films, and build the perfect watchlist for any mood.",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
];

function PosterStrip({ movies, reverse = false }) {
  if (!movies?.length) return null;
  const doubled = [...movies, ...movies];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className={`flex gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {doubled.map((movie, i) => (
          <Link
            key={`${movie.id}-${i}`}
            to={`/movie/${movie.id}`}
            tabIndex={-1}
            aria-hidden="true"
            className="shrink-0 w-24 sm:w-32 aspect-[2/3] rounded-lg overflow-hidden group"
          >
            {movie.poster_path ? (
              <img
                src={posterUrl(movie.poster_path)}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-90"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-lg" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const recentlyViewed = usePreferencesStore((s) => s.recentlyViewed);
  usePageTitle("Home");
  const reducedMotion = useReducedMotion();
  const [heroIndex, setHeroIndex] = useState(0);

  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrendingMovies,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (!trending?.length || reducedMotion) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % Math.min(trending.length, 6));
    }, 5000);
    return () => clearInterval(timer);
  }, [trending?.length, reducedMotion]);

  const heroMovie = trending?.[heroIndex];
  const heroBackdrop = heroMovie ? backdropUrl(heroMovie.backdrop_path) : null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: reducedMotion ? 0 : 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : 0.5, ease: "easeOut" } },
  };

  return (
    <div className="relative">
      {/* ── Hero ── */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden">
        {/* Backdrop images */}
        <AnimatePresence mode="sync">
          {heroBackdrop && (
            <motion.div
              key={heroBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 1.5 }}
              className="absolute inset-0"
            >
              <img
                src={heroBackdrop}
                alt=""
                className="w-full h-full object-cover scale-[1.03]"
                loading="eager"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            {/* Trending pill */}
            <motion.div variants={item} className="mb-6">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>
                  {heroMovie
                    ? <>Trending now &middot; <span className="text-foreground font-medium">{heroMovie.title}</span></>
                    : "Discover movies"}
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight"
            >
              Your Personal{" "}
              <span className="gradient-text">Movie Watchlist</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-lg sm:text-xl text-muted-foreground/90 max-w-xl leading-relaxed"
            >
              Search millions of movies, view ratings and details, and build
              the perfect watchlist — all in one place.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="rounded-full shadow-lg shadow-primary/25 text-base px-8"
                asChild
              >
                <Link to="/search">
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Start Exploring
                </Link>
              </Button>
              {!user && (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full text-base px-8 glass border-border/50"
                  asChild
                >
                  <Link to="/auth/signup">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Backdrop dot indicators */}
          {trending && (
            <div className="absolute bottom-8 left-4 sm:left-auto sm:right-8 flex gap-1.5">
              {trending.slice(0, 6).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Show backdrop ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === heroIndex
                      ? "w-6 bg-foreground"
                      : "w-1.5 bg-foreground/30 hover:bg-foreground/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Poster Strip ── */}
      {trending && trending.length >= 10 && (
        <section className="relative py-8 space-y-3">
          <PosterStrip movies={trending.slice(0, 10)} />
          <PosterStrip movies={[...trending].reverse().slice(0, 10)} reverse />
        </section>
      )}

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Recently Viewed
                </Badge>
                <h2 className="text-2xl font-bold">Continue Watching</h2>
              </div>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            >
              {recentlyViewed.slice(0, 10).map((movie, i) => (
                <motion.div key={movie.id} variants={item}>
                  <MovieCard movie={movie} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Trending This Week ── */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
              <h2 className="text-2xl font-bold">This Week</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/search">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {trending ? (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            >
              {trending.slice(0, 10).map((movie, i) => (
                <motion.div key={movie.id} variants={item}>
                  <MovieCard movie={movie} index={i} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-20 pb-28 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-extrabold tracking-tight">
              Everything you need
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Powered by TMDB for the most up-to-date movie data in the world.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item}>
                <div className="glass rounded-2xl p-8 h-full card-glow hover:border-border transition-all duration-500">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow} mb-6`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
