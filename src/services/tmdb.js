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

  return {
    ...details,
    directors,
    cast,
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
