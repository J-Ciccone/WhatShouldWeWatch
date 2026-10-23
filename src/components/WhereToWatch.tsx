import { ExternalLink } from "lucide-react";
import { useMovieExtras } from "../hooks/useTmdb";
import { imageUrl, type Provider } from "../lib/tmdb";
import { Spinner } from "./ui/Spinner";

function ProviderList({ label, providers }: { label: string; providers: Provider[] }) {
  if (providers.length === 0) return null;
  return (
    <div className="watch-row">
      <span className="watch-row-label">{label}</span>
      {providers.slice(0, 6).map((p) => (
        <span key={p.id} className="provider">
          {p.logoPath && <img src={imageUrl(p.logoPath, "w92")} alt="" loading="lazy" />}
          {p.name}
        </span>
      ))}
    </div>
  );
}

/** Streaming, rental and purchase options for the viewer's region (TMDB + JustWatch data). */
export function WhereToWatch({ movieId }: { movieId: string }) {
  const extras = useMovieExtras(movieId);

  if (extras.status === "loading") {
    return (
      <div className="watch-row muted small">
        <Spinner size="sm" label="Finding where to watch…" /> Finding where to watch…
      </div>
    );
  }
  if (extras.status === "error") return null;

  const { stream, rent, buy, link } = extras.data.watch;
  const nothing = stream.length + rent.length + buy.length === 0;

  return (
    <div className="watch">
      {nothing ? (
        <p className="muted small" style={{ margin: 0 }}>
          We couldn't find this streaming in your region right now.
        </p>
      ) : (
        <>
          <ProviderList label="Stream" providers={stream} />
          {stream.length === 0 && <ProviderList label="Rent" providers={rent} />}
          {stream.length === 0 && rent.length === 0 && <ProviderList label="Buy" providers={buy} />}
        </>
      )}
      <span className="attribution">
        Where-to-watch data from JustWatch via TMDB.
        {link && (
          <>
            {" "}
            <a href={link} target="_blank" rel="noreferrer">
              All options <ExternalLink size={11} aria-hidden="true" />
            </a>
          </>
        )}
      </span>
    </div>
  );
}
