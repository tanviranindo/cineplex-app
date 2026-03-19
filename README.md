# Cineplex

Cineplex is a React movie discovery and watchlist app powered by TMDB and Firebase.  
It supports account-based watchlists, advanced browse filters, movie/person detail pages, and a polished responsive UI with dark mode.

Visit

- [https://mywishlist.vercel.app] (https://mywishlist.vercel.app)
- [https://cineplex-app.vercel.app/] (https://cineplex-app.vercel.app)

## Features

- **TMDB-powered discovery**: Search movies, browse by genre, and explore trending titles.
- **Advanced filtering**: Filter by genre, sort, year, language, minimum rating, actor, and director.
- **Movie detail experience**: Trailer modal, cast and director links, rating metadata, and similar movies.
- **Where to watch**: Streaming/rent/buy provider data with direct outbound links.
- **Watchlist management**: Add/remove movies and track status (`to_watch`, `watched`, `favorite`).
- **Account system**: Firebase Auth with email/password + Google sign-in.
- **Persistent preferences**: Firestore-backed theme, watchlist tab/sort, recent searches, and recently viewed movies.
- **Modern UX**: Responsive layout, animations (Framer Motion), lazy-loaded routes, skeleton states, toast feedback.

## Tech Stack

| Category           | Technology                                     |
| ------------------ | ---------------------------------------------- |
| Framework          | React 18 + Vite 5                              |
| Styling            | Tailwind CSS v3                                |
| UI Primitives      | Radix UI + custom `shadcn/ui` style components |
| Data Fetching      | TanStack Query                                 |
| State Management   | Zustand                                        |
| Routing            | React Router v7                                |
| Forms & Validation | React Hook Form + Zod                          |
| Backend Services   | Firebase Auth + Firestore                      |
| Movie Data API     | TMDB API (v3)                                  |
| Motion & Feedback  | Framer Motion + Sonner                         |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/))
- A TMDB API bearer token
- A Firebase project with Authentication + Firestore enabled

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required variables:

```env
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMG_BASE_URL=https://image.tmdb.org/t/p
VITE_TMDB_TOKEN=your_tmdb_bearer_token_here

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Installation & Development

Using npm:

```bash
npm install
npm run dev
```

Using Bun:

```bash
bun install
bun dev
```

App runs at `http://localhost:5173`.

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Firestore Security Rules

This project includes `firestore.rules` that only allow authenticated users to access their own data under:

`users/{userId}/...`

Deploy these rules in your Firebase project before production use.

## Main Routes

- `/` - Home
- `/search` - Search + genre discovery
- `/browse` - Advanced browse filters
- `/movie/:id` - Movie details
- `/person/:id` - Person details
- `/watchlist` - Protected watchlist page
- `/account` - Protected account settings
- `/auth/signin` and `/auth/signup` - Authentication pages

## Project Structure

```text
src/
├── components/          # Layout, cards, auth UI, reusable UI primitives
├── hooks/               # Debounce, intersection observer, document title helpers
├── lib/                 # Query client/keys, validation schemas, utilities
├── pages/               # Home, Search, Browse, Detail, Watchlist, Account, Auth
├── services/            # Firebase and TMDB integrations
├── stores/              # Zustand stores (auth, watchlist, preferences, theme)
├── App.jsx              # Routes + app shell
└── main.jsx             # React and QueryClient providers
```

## Credits

- Movie metadata and images: [TMDB](https://www.themoviedb.org/)
- Watch provider availability: JustWatch (via TMDB watch provider endpoints)
