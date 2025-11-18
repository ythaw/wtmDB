// src/components/Nav.jsx
import { useState, useEffect } from "react";
import "../styles/Nav.css";
import logo from "../assets/logo.png";

export default function Nav({ onSearch, onClear, onSortChange, query: parentQuery = "" }) {
  const [query, setQuery] = useState(parentQuery);
  const [sort, setSort] = useState("title");

  // Sync local state with parent when parent clears
  useEffect(() => {
    if (parentQuery === "") {
      setQuery("");
    }
  }, [parentQuery]);

  const submit = (e) => { 
    e.preventDefault(); 
    onSearch(query.trim()); 
  };
  
  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // Update parent in real-time for debounced search
    onSearch(newQuery.trim());
  };
  
  const clear = () => { 
    setQuery(""); 
    onClear(); 
  };

  return (
    <nav className="nav__inner" aria-label="Main">
      <div className="nav__brand">
        <img src={logo} alt="Flixster Logo" className="nav__logo" />
        <h1 className="nav__title"><i>wtmDB</i></h1>
      </div>

      {/* Search group: input + Search + Clear inline */}
      <form className="nav__search" onSubmit={submit} role="search" aria-label="Search by title">
        <label htmlFor="search" className="sr-only">Search by title</label>
        <input
          id="search"
          type="text"
          placeholder="Search movies…"
          value={query}
          onChange={handleChange}
        />
        <div className="nav__actions">
          <button type="submit">Search</button>
          <button type="button" onClick={clear}>Clear</button>
        </div>
      </form>

      <div className="nav__sort">
        <label htmlFor="sort">Sort:</label>
        <select id="sort" value={sort} onChange={(e) => { setSort(e.target.value); onSortChange(e.target.value); }}>
          <option value="title">Title (A–Z)</option>
          <option value="rating">Rating (High → Low)</option>
          <option value="date">Release Date (New → Old)</option>
        </select>
      </div>
    </nav>
  );
}
