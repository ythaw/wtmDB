// src/components/Modal.jsx
import { useEffect, useRef } from "react";
import "../styles/Modal.css";
import defaultPoster from "../assets/default-poster.jpg";

export default function Modal({ isOpen, onClose, movie, loading, error }) {
  const dialogRef = useRef(null);
  const lastActiveRef = useRef(null);

  // open: save last focus, move focus into dialog
  useEffect(() => {
    if (!isOpen) return;
    lastActiveRef.current = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    first?.focus();
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Trap focus within dialog
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const focusable = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusable);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    dialog.addEventListener("keydown", handleTab);
    return () => dialog.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Return focus to the opener on close
  useEffect(() => {
    if (isOpen) return;
    lastActiveRef.current?.focus?.();
  }, [isOpen]);

  if (!isOpen) return null;

  const poster = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : defaultPoster;

  const runtime = movie?.runtime ? `${movie.runtime} min` : "—";
  const release = movie?.release_date
    ? new Date(movie.release_date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";
  const genres = movie?.genres?.length ? movie.genres.map(g => g.name).join(", ") : "—";
  const rating = movie?.vote_average != null ? `${movie.vote_average.toFixed(1)}/10` : "—";
  const trailerKey = movie?.videos?.results?.find(v => v.site === "YouTube" && v.type === "Trailer")?.key;

  return (
    <div className="modal__backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-title"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>

        {loading && <p className="modal__status">Loading…</p>}
        {error && <p className="modal__error">{error}</p>}

        {!loading && !error && movie && (
          <div className="modal__content">
            <img 
              className="modal__poster" 
              src={poster} 
              alt={`${movie.title} poster`}
              onError={(e) => {
                if (e.currentTarget.src !== defaultPoster) {
                  e.currentTarget.src = defaultPoster;
                }
              }}
            />
            <div className="modal__details">
              <h2 id="movie-title" className="modal__title">{movie.title}</h2>
              <ul className="modal__meta">
                <li><strong>Runtime:</strong> {runtime}</li>
                <li><strong>Release:</strong> {release}</li>
                <li><strong>Genres:</strong> {genres}</li>
                <li><strong>Rating:</strong> {rating}</li>
              </ul>
              <p className="modal__overview">{movie.overview || "No overview available."}</p>
              {trailerKey && (
                <a className="modal__trailer" href={`https://www.youtube.com/watch?v=${trailerKey}`} target="_blank" rel="noreferrer">
                  ▶ Watch Trailer
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
