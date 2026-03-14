# Cineplex - Movie Watchlist App

A modern movie watchlist app built with React and shadcn/ui. Search movies, view details, and manage your watchlist with a beautiful, responsive interface.

## Features

- **Movie Search** — Debounced real-time search with pagination via OMDb API
- **Movie Details** — Ratings, plot, cast, director, box office, genre tags
- **Watchlist** — Add/remove with confirmation dialog, per-user persistence
- **Authentication** — Sign up / sign in with localStorage mock
- **Dark/Light Theme** — Toggle with persistence
- **Responsive** — Mobile-first across all breakpoints
- **Animations** — Smooth transitions via Framer Motion
- **Toast Notifications** — Sonner for action feedback

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 + Vite 5 |
| UI Components | shadcn/ui (Radix + Tailwind + CVA) |
| Styling | Tailwind CSS v3 |
| Server State | TanStack Query |
| Client State | Zustand |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Toasts | Sonner |
| Icons | Lucide React |
| API | OMDb API |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)

### Installation

```bash
git clone https://github.com/tanviranindo/cineplex-app.git
cd cineplex-app
bun install
bun dev
```

App runs at `http://localhost:5173`

### Production Build

```bash
bun run build
bun preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── Layout.jsx
│   ├── MovieCard.jsx
│   ├── Navbar.jsx
│   └── ...
├── hooks/               # useDebounce
├── pages/               # Home, Login, SearchMovies, MovieDetail, Watchlist
├── services/            # OMDb API
├── stores/              # Zustand (auth, watchlist, theme)
├── lib/utils.js         # cn() utility
├── App.jsx
└── main.jsx
```

## Demo

[Demo video — Google Drive link]

## License

MIT
