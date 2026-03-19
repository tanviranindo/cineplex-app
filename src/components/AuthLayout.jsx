import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { getTrendingMovies, posterUrl } from '../services/tmdb';

export default function AuthLayout({ children, posterSide = 'left' }) {
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrendingMovies,
    staleTime: 1000 * 60 * 30,
  });

  if (authReady && user) return <Navigate to="/search" replace />;

  const isLeft = posterSide === 'left';

  const posterPanel = (
    <motion.div
      key={`poster-${posterSide}`}
      initial={{ opacity: 0, x: isLeft ? 80 : -80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:block lg:w-5/12 xl:w-1/2 relative overflow-hidden shrink-0"
    >
      {trending && trending.length >= 9 ? (
        <div className="absolute inset-0 grid grid-cols-3 gap-0">
          {trending.slice(0, 9).map((movie) => (
            <div key={movie.id} className="relative overflow-hidden">
              {movie.poster_path ? (
                <img
                  src={posterUrl(movie.poster_path)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900" />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div
        className={`absolute inset-0 ${
          isLeft
            ? 'bg-gradient-to-r from-transparent to-background/80'
            : 'bg-gradient-to-l from-transparent to-background/80'
        }`}
      />
      <div
        className={`absolute bottom-0 ${isLeft ? 'left-0 right-0' : 'left-0 right-0'} p-10 bg-gradient-to-t from-black/80 to-transparent`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Cineplex</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Cinema, Your Way</h2>
        <p className="text-white/70 text-sm leading-relaxed max-w-xs">
          Discover, save, and curate your perfect movie collection — all in one place.
        </p>
      </div>
    </motion.div>
  );

  const formPanel = (
    <motion.div
      key={`form-${posterSide}`}
      initial={{ opacity: 0, x: isLeft ? -80 : 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-x-hidden"
    >
      <div className="ambient-orb w-96 h-96 bg-violet-500/15 -top-20 -right-20 animate-float" />
      <div className="ambient-orb w-72 h-72 bg-cyan-500/10 bottom-10 -left-20 animate-float-slow" />
      {children}
    </motion.div>
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex overflow-hidden">
      {isLeft ? (
        <>
          {posterPanel}
          {formPanel}
        </>
      ) : (
        <>
          {formPanel}
          {posterPanel}
        </>
      )}
    </div>
  );
}
