const API_KEY = "4a3b711b";
const BASE_URL = "https://www.omdbapi.com";

export async function searchMovies(query, page = 1) {
  const res = await fetch(
    `${BASE_URL}/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}&type=movie`
  );
  const data = await res.json();
  if (data.Response === "False") {
    return { results: [], total: 0 };
  }
  return {
    results: data.Search || [],
    total: parseInt(data.totalResults, 10) || 0,
  };
}

export async function getMovieById(imdbID) {
  const res = await fetch(
    `${BASE_URL}/?apikey=${API_KEY}&i=${imdbID}&plot=full`
  );
  const data = await res.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Movie not found");
  }
  return data;
}

const FEATURED_IDS = [
  "tt0111161",
  "tt0068646",
  "tt0468569",
  "tt0137523",
  "tt0110912",
  "tt0109830",
  "tt1375666",
  "tt0167260",
  "tt0080684",
  "tt0133093",
];

export async function getFeaturedMovies() {
  const promises = FEATURED_IDS.map((id) => getMovieById(id));
  const results = await Promise.allSettled(promises);
  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
}
