import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Cineplex` : "Cineplex - Movie Watchlist";
  }, [title]);
}
