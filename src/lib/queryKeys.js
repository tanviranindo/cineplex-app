export const queryKeys = {
  movies: {
    detail: (id) => ['movies', 'detail', String(id)],
    similar: (id) => ['movies', 'similar', String(id)],
    providers: (id) => ['movies', 'providers', String(id)],
  },
  search: {
    infinite: (query) => ['search', 'infinite', query],
  },
  discover: {
    infinite: (genreId) => ['discover', 'infinite', String(genreId)],
  },
  browse: {
    infinite: (filters) => ['browse', 'infinite', filters],
  },
  trending: ['trending'],
  genres: ['genres'],
}
