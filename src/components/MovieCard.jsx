import "../styles/MovieCard.css";
import defaultPoster from "../assets/default-poster.jpg";

export default function MovieCard({ movie, onClick }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : defaultPoster;

  const rating =
    typeof movie.vote_average === "number" ? `${movie.vote_average.toFixed(1)}/10` : "—/10";

  const handleImageError = (e) => {
    // If the image fails to load, use the default poster
    if (e.currentTarget.src !== defaultPoster) {
      e.currentTarget.src = defaultPoster;
    }
  };

  return (
    <div className="movie-card" onClick={() => onClick(movie)} tabIndex={0} role="button" aria-label={`View details for ${movie.title}`} onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') onClick(movie); }}>
      <img
        src={posterUrl}
        alt={movie.title}
        loading="lazy"
        onError={handleImageError}
      />
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="rating">{rating}</p>
      </div>
    </div>
  );
}
