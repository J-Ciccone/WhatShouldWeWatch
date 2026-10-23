import { Link, Outlet, useLocation } from "react-router";
import logo from "../assets/logo.png";

export function Layout() {
  const isHome = useLocation().pathname === "/";
  return (
    <div className="app-shell">
      {!isHome && (
        <header className="app-header">
          <Link to="/" className="logo-link" aria-label="What Should We Watch? home">
            <img src={logo} alt="" width={120} height={120} />
          </Link>
        </header>
      )}
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        This product uses the{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
          TMDB
        </a>{" "}
        API but is not endorsed or certified by TMDB.
      </footer>
    </div>
  );
}
