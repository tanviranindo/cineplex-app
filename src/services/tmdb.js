const TOKEN = import.meta.env.VITE_TMDB_TOKEN
const BASE = 'https://api.themoviedb.org/3'
export const IMG_BASE = 'https://image.tmdb.org/t/p'

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function tmdbFetch(path) {
  const res = await fetch(`${BASE}${path}`, { headers })
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export function posterUrl(path, size = 'w500') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}

export function backdropUrl(path, size = 'w1280') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}

export async function searchMovies(query, page = 1) {
  const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`)
  return {
    results: data.results || [],
    total: data.total_results || 0,
    totalPages: data.total_pages || 0,
  }
}

export async function getMovieById(movieId) {
  const [details, credits] = await Promise.all([
    tmdbFetch(`/movie/${movieId}?append_to_response=videos`),
    tmdbFetch(`/movie/${movieId}/credits`),
  ])

  const directors = credits.crew?.filter((c) => c.job === 'Director').map((c) => c.name) || []
  const cast = credits.cast?.slice(0, 6).map((c) => c.name) || []

  const directorsDetailed = credits.crew
    ?.filter((c) => c.job === 'Director')
    .map((c) => ({ id: c.id, name: c.name, profilePath: c.profile_path })) || []
  const castDetailed = credits.cast
    ?.slice(0, 10)
    .map((c) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path })) || []

  return {
    ...details,
    directors,
    cast,
    directorsDetailed,
    castDetailed,
  }
}

export async function getTrendingMovies() {
  const data = await tmdbFetch('/trending/movie/week')
  return data.results?.slice(0, 10) || []
}

export async function getPopularMovies() {
  const data = await tmdbFetch('/movie/popular')
  return data.results?.slice(0, 10) || []
}

// Genre ID → name mapping (cached)
let genreMap = null

export async function getGenres() {
  if (genreMap) return genreMap
  const data = await tmdbFetch('/genre/movie/list?language=en')
  genreMap = {}
  data.genres.forEach((g) => { genreMap[g.id] = g.name })
  return genreMap
}

export function getGenreNames(genreIds, genres) {
  if (!genres || !genreIds) return []
  return genreIds.map((id) => genres[id]).filter(Boolean)
}

export async function getSimilarMovies(movieId) {
  const data = await tmdbFetch(`/movie/${movieId}/similar`)
  return data.results?.slice(0, 6) || []
}

export async function discoverByGenre(genreId, page = 1) {
  const data = await tmdbFetch(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
  )
  return {
    results: data.results || [],
    total: data.total_results || 0,
    totalPages: data.total_pages || 0,
  }
}

export async function discoverMovies({ genreId, sortBy = 'popularity.desc', year, language, ratingGte, withCast, withCrew } = {}, page = 1) {
  const params = new URLSearchParams({
    sort_by: sortBy,
    page: String(page),
    'vote_count.gte': '50',
  })
  if (genreId) params.set('with_genres', String(genreId))
  if (year) params.set('primary_release_year', String(year))
  if (language) params.set('with_original_language', language)
  if (ratingGte) params.set('vote_average.gte', String(ratingGte))
  if (withCast) params.set('with_cast', String(withCast))
  if (withCrew) params.set('with_crew', String(withCrew))
  // Upcoming: sort by future release date ascending
  if (sortBy === 'primary_release_date.asc') {
    params.set('primary_release_date.gte', new Date().toISOString().slice(0, 10))
    params.delete('primary_release_year')
  }
  const data = await tmdbFetch(`/discover/movie?${params}`)
  return {
    results: data.results || [],
    total: data.total_results || 0,
    totalPages: data.total_pages || 0,
  }
}

export async function getWatchProviders(movieId) {
  const data = await tmdbFetch(`/movie/${movieId}/watch/providers`)
  const us = data.results?.US
  return {
    stream: us?.flatrate || [],
    rent: us?.rent || [],
    buy: us?.buy || [],
    link: us?.link || null,
  }
}

export async function getPersonById(personId) {
  const [person, credits] = await Promise.all([
    tmdbFetch(`/person/${personId}`),
    tmdbFetch(`/person/${personId}/movie_credits`),
  ])

  const castCredits = (credits.cast || [])
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 30)
  const crewCredits = (credits.crew || [])
    .filter((c) => c.job === 'Director')
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 20)

  return {
    id: person.id,
    name: person.name,
    biography: person.biography,
    birthday: person.birthday,
    deathday: person.deathday,
    placeOfBirth: person.place_of_birth,
    profilePath: person.profile_path,
    department: person.known_for_department,
    alsoKnownAs: person.also_known_as,
    homepage: person.homepage,
    castCredits,
    crewCredits,
  }
}

export async function searchPeople(query) {
  if (!query || query.length < 2) return []
  const data = await tmdbFetch(`/search/person?query=${encodeURIComponent(query)}`)
  return (data.results || [])
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      department: p.known_for_department || 'Acting',
      profilePath: p.profile_path,
    }))
}

export function profileUrl(path, size = 'w185') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}
