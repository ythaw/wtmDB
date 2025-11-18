import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <p>© {new Date().getFullYear()} Flixster • Data from TMDB</p>
      <p><a href="https://www.themoviedb.org/documentation/api" target="_blank" rel="noreferrer">TMDB API</a></p>
    </footer>
  );
}
