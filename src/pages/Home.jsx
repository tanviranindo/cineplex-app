import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, UserPlus, Search, Star, BookmarkCheck, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../stores/authStore";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: Search,
    title: "Search Movies",
    description: "Browse over 500,000 movies from the OMDb database with instant search.",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: Star,
    title: "View Ratings",
    description: "See IMDb ratings, Rotten Tomatoes scores, and Metacritic ratings.",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    icon: BookmarkCheck,
    title: "Build Watchlist",
    description: "Save your favorites and build the perfect watchlist for any mood.",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
];

export default function Home() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="ambient-orb w-96 h-96 bg-violet-500/20 -top-48 -left-48 animate-float" />
      <div className="ambient-orb w-80 h-80 bg-cyan-500/15 top-20 -right-40 animate-float-slow" />
      <div className="ambient-orb w-64 h-64 bg-purple-500/10 bottom-20 left-1/3 animate-float" />

      {/* Hero */}
      <section className="relative py-24 sm:py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            {/* Pill badge */}
            <motion.div variants={item} className="flex justify-center mb-8">
              <div className="glass rounded-full px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Discover 500,000+ movies</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight"
            >
              Your Ultimate{" "}
              <span className="gradient-text">Movie Watchlist</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Search, discover, and curate your perfect movie collection.
              Track what you want to watch and never miss a great film again.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={item}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
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
                  className="rounded-full text-base px-8"
                  asChild
                >
                  <Link to="/login">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item}>
                <div className="glass rounded-2xl p-8 h-full card-glow hover:border-white/20 transition-all duration-500">
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
