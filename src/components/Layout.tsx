import { Popcorn } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";

export function Layout() {
  const isHome = useLocation().pathname === "/";
  return (
    <div className="app-shell">
      {!isHome && (
        <header className="app-header">
          <Link to="/" className="brand" aria-label="What Should We Watch? Home">
            <span className="brand-mark" aria-hidden="true">
              <Popcorn size={20} />
            </span>
            <span>What Should We Watch?</span>
          </Link>
        </header>
      )}
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        Movie data from{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB.
      </footer>
    </div>
  );
}
