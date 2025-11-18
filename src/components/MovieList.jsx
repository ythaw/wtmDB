// src/components/MovieList.jsx
import "../styles/MovieList.css";
import MovieCard from "./MovieCard.jsx";

export default function MovieList({ movies, onCardClick }) {
  if (!movies.length) {
    return <p className="empty-state">No movies found.</p>;
  }

  return (
    <section className="movie-list">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} onClick={onCardClick} />
      ))}
    </section>
  );
}
