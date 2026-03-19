import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpDown,
  Users,
  Clapperboard,
  Calendar,
  MapPin,
  Film,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import MovieCard from '../components/MovieCard';
import { getPersonById, profileUrl } from '../services/tmdb';
import { usePageTitle } from '../hooks/usePageTitle';

const PLACEHOLDER_PERSON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' fill='%231a1a2e'%3E%3Crect width='300' height='450'/%3E%3Ctext x='150' y='225' text-anchor='middle' fill='%238b5cf6' font-size='16' font-family='sans-serif'%3ENo Photo%3C/text%3E%3C/svg%3E";

function PersonSkeleton() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="h-8 w-20 bg-muted rounded-full mb-6 animate-pulse" />
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="w-52 sm:w-64 aspect-[2/3] rounded-2xl bg-muted animate-pulse" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="space-y-2 mt-6">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateAge(birthday, deathday) {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age;
}

function movieYear(movie) {
  return parseInt((movie?.release_date || '').slice(0, 4), 10) || 0;
}

function sortCredits(credits = [], sortBy = 'popularity_desc') {
  const sorted = [...credits];
  switch (sortBy) {
    case 'year_desc':
      return sorted.sort(
        (a, b) => movieYear(b) - movieYear(a) || (b.popularity || 0) - (a.popularity || 0)
      );
    case 'year_asc':
      return sorted.sort(
        (a, b) => movieYear(a) - movieYear(b) || (b.popularity || 0) - (a.popularity || 0)
      );
    case 'title_asc':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'rating_desc':
      return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    case 'popularity_desc':
    default:
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }
}

export default function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllCrew, setShowAllCrew] = useState(false);
  const [castSortBy, setCastSortBy] = useState('popularity_desc');
  const [crewSortBy, setCrewSortBy] = useState('popularity_desc');

  const {
    data: person,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['person', 'detail', id],
    queryFn: () => getPersonById(id),
  });

  usePageTitle(person?.name);

  if (isLoading) return <PersonSkeleton />;

  if (isError || !person) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <Users className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-xl font-medium">Person not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const photo = profileUrl(person.profilePath, 'h632') || PLACEHOLDER_PERSON;
  const age = calculateAge(person.birthday, person.deathday);
  const isDirector = person.department === 'Directing';
  const hasCast = person.castCredits?.length > 0;
  const hasCrew = person.crewCredits?.length > 0;
  const INITIAL_SHOW = 10;
  const sortedCastCredits = sortCredits(person.castCredits, castSortBy);
  const sortedCrewCredits = sortCredits(person.crewCredits, crewSortBy);
  const visibleCast = showAllCast ? sortedCastCredits : sortedCastCredits?.slice(0, INITIAL_SHOW);
  const visibleCrew = showAllCrew ? sortedCrewCredits : sortedCrewCredits?.slice(0, INITIAL_SHOW);

  return (
    <div className="relative overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="ambient-orb w-96 h-96 bg-violet-500/10 -top-20 -right-40 animate-float" />
      <div className="ambient-orb w-64 h-64 bg-cyan-500/10 bottom-40 -left-32 animate-float-slow" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back button */}
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

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 mx-auto lg:mx-0"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-violet-500/20 rounded-3xl blur-3xl" />
              <img
                src={photo}
                alt={person.name}
                fetchPriority="high"
                className="relative w-52 sm:w-64 rounded-2xl shadow-2xl object-cover aspect-[2/3]"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 space-y-5"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{person.name}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="gap-1">
                  {isDirector ? (
                    <Clapperboard className="h-3 w-3" />
                  ) : (
                    <Users className="h-3 w-3" />
                  )}
                  {person.department || 'Acting'}
                </Badge>
                {person.birthday && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(person.birthday).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {age != null && !person.deathday && ` (age ${age})`}
                  </Badge>
                )}
                {person.deathday && (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    Died{' '}
                    {new Date(person.deathday).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {age != null && ` (age ${age})`}
                  </Badge>
                )}
                {person.placeOfBirth && (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {person.placeOfBirth}
                  </Badge>
                )}
              </div>
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Biography
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {person.biography.length > 800
                    ? person.biography.slice(0, 800) + '...'
                    : person.biography}
                </p>
              </div>
            )}

            {/* External links */}
            {person.homepage && (
              <a
                href={person.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Official Website
              </a>
            )}
          </motion.div>
        </div>
      </div>

      {/* Filmography — as Actor */}
      {hasCast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className={`mt-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${!hasCrew ? 'pb-8' : ''}`}
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Film className="h-3 w-3" />
                Actor
              </Badge>
              <h2 className="text-xl font-bold">Known For</h2>
              <span className="text-sm text-muted-foreground">({person.castCredits.length})</span>
            </div>
            <Select value={castSortBy} onValueChange={setCastSortBy}>
              <SelectTrigger className="h-9 w-full text-xs sm:w-56">
                <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Sort credits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity_desc">Popularity (high to low)</SelectItem>
                <SelectItem value="year_desc">Year (newest first)</SelectItem>
                <SelectItem value="year_asc">Year (oldest first)</SelectItem>
                <SelectItem value="rating_desc">Rating (highest first)</SelectItem>
                <SelectItem value="title_asc">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {visibleCast.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          {person.castCredits.length > INITIAL_SHOW && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setShowAllCast((s) => !s)}>
                {showAllCast ? 'Show Less' : `Show All ${person.castCredits.length} Credits`}
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Filmography — as Director */}
      {hasCrew && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mt-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clapperboard className="h-3 w-3" />
                Director
              </Badge>
              <h2 className="text-xl font-bold">Directed</h2>
              <span className="text-sm text-muted-foreground">({person.crewCredits.length})</span>
            </div>
            <Select value={crewSortBy} onValueChange={setCrewSortBy}>
              <SelectTrigger className="h-9 w-full text-xs sm:w-56">
                <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Sort credits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity_desc">Popularity (high to low)</SelectItem>
                <SelectItem value="year_desc">Year (newest first)</SelectItem>
                <SelectItem value="year_asc">Year (oldest first)</SelectItem>
                <SelectItem value="rating_desc">Rating (highest first)</SelectItem>
                <SelectItem value="title_asc">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {visibleCrew.map((movie) => (
              <MovieCard key={`dir-${movie.id}`} movie={movie} />
            ))}
          </div>
          {person.crewCredits.length > INITIAL_SHOW && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setShowAllCrew((s) => !s)}>
                {showAllCrew ? 'Show Less' : `Show All ${person.crewCredits.length} Credits`}
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
