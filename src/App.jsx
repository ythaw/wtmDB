// src/App.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import Nav from "./components/Nav.jsx";
import MovieList from "./components/MovieList.jsx";
import Modal from "./components/Modal.jsx";
import api from "./api/axios";
import useDebounce from "./hooks/useDebounce";
import "./App.css";

export default function App() {
  // ---------- state ----------
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("title"); // "title" | "rating" | "date"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // ---------- helpers ----------
  const debouncedQuery = useDebounce(query, 500);
  const abortRef = useRef(null);

  // remove zero-width/invisible spaces, then trim
  const cleanQuery = (q = "") =>
    q.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

  const hasMore = page < totalPages;

  // sorters
  const compare = {
    title: (a, b) =>
      (a.title || "").localeCompare(b.title || "", undefined, {
        sensitivity: "base",
        numeric: true,
      }),
    rating: (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0),
    date: (a, b) =>
      new Date(b.release_date || 0) - new Date(a.release_date || 0),
  };

  // stable copy + sort
  const sortedMovies = useMemo(() => {
    const list = movies.slice();
    (compare[sort] ? list.sort(compare[sort]) : list.sort(compare.title));
    return list;
  }, [movies, sort]);

  // merge without duplicates (by movie id)
  function mergeUnique(prev, next) {
    const seen = new Set(prev.map((m) => m.id));
    const merged = [...prev];
    for (const m of next) if (!seen.has(m.id)) merged.push(m);
    return merged;
  }

  // ---------- data fetching ----------
  async function fetchMovies({
    q = debouncedQuery,
    p = page,
    append = false,
  } = {}) {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const qClean = cleanQuery(q);
      const isSearch = qClean.length > 0;

      const endpoint = isSearch ? "/search/movie" : "/movie/popular";
      const params = isSearch
        ? { query: qClean, include_adult: false, page: p }
        : { page: p };

      const res = await api.get(endpoint, {
        params,
        signal: controller.signal,
      });

      const results = res.data?.results ?? [];
      setTotalPages(res.data?.total_pages ?? 1);

      setMovies((prev) => (append ? mergeUnique(prev, results) : results));
    } catch (e) {
      if (e.name !== "CanceledError" && e.message !== "canceled") {
        setError("Failed to fetch movies.");
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }

  // load when debounced query or page changes
  useEffect(() => {
    fetchMovies({ append: page > 1 });
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page]);

  // ---------- modal: fetch details ----------
  const openDetails = (movie) => setSelectedId(movie.id);

  const closeDetails = () => {
    setSelectedId(null);
    setDetails(null);
    setDetailsError(null);
  };

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;
    (async () => {
      try {
        setDetailsLoading(true);
        setDetailsError(null);
        const res = await api.get(`/movie/${selectedId}`, {
          params: { append_to_response: "videos" },
        });
        if (!cancelled) setDetails(res.data);
      } catch (e) {
        if (!cancelled) setDetailsError("Failed to load details.");
        console.error(e);
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // ---------- handlers ----------
  const handleSearch = (q) => {
    setPage(1);
    setQuery(q);
  };

  const handleClear = () => {
    setQuery("");
    setPage(1);
  };

  const handleSortChange = (value) => setSort(value);

  const loadMore = () => {
    if (!loading && hasMore) setPage((p) => p + 1);
  };

  // ---------- UI ----------
  return (
    <>
      <header className="nav">
        <div className="app-shell">
          <Nav
            onSearch={handleSearch}
            onClear={handleClear}
            onSortChange={handleSortChange}
            query={query}
          />
        </div>
      </header>

      <main className="app-main app-shell">
        {error && <p className="error">{error}</p>}

        <MovieList movies={sortedMovies} onCardClick={openDetails} />

        <div className="load-more-wrap">
          <button
            className="load-more"
            onClick={loadMore}
            disabled={loading || !hasMore}
            aria-disabled={loading || !hasMore}
            aria-label={hasMore ? "Load more movies" : "No more results"}
          >
            {loading ? "Loading…" : hasMore ? "Load More" : "No more results"}
          </button>
        </div>

        <Modal
          isOpen={!!selectedId}
          onClose={closeDetails}
          movie={details}
          loading={detailsLoading}
          error={detailsError}
        />
      </main>
    </>
  );
}
