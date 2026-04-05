"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

type Resource = {
  id: string;
  title: string;
  type: string;
  subject: string;
  description: string;
  tags: { tag: { name: string } }[];
  rank?: number;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Fetch initial/trending resources
    fetchResults("");
  }, []);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!res.ok) {
        setResults([]);
        return;
      }
      
      const data = await res.json();
      
      // Ensure data is array
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    fetchResults(query);
  };

  return (
    <div className="container">
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Find Your <span className="gradient-text">Academic Resources</span>
        </h1>
        <p className={styles.subtitle}>
          Search across thousands of PDFs, class notes, and external links uploaded by students.
        </p>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for courses, notes, or topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      <div className={styles.resultsContainer}>
        {hasSearched && !loading && results.length === 0 && (
          <div className={styles.emptyState}>
            <h2>No results found</h2>
            <p>We couldn't find anything matching "{query}". Try different keywords or check out trending resources.</p>
          </div>
        )}

        {!hasSearched && results.length > 0 && <h3 className={styles.sectionTitle}>Trending Recently</h3>}
        {hasSearched && results.length > 0 && <h3 className={styles.sectionTitle}>Search Results</h3>}

        <div className={styles.grid}>
          {results.map((r) => (
            <Link href={`/resource/${r.id}`} key={r.id} className="glass-card">
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span className={styles.badge}>{r.type}</span>
                  <span className={styles.subject}>{r.subject}</span>
                </div>
                <h3 className={styles.cardTitle}>{r.title}</h3>
                <p className={styles.cardDesc}>
                  {r.description ? r.description.slice(0, 100) + '...' : 'No description provided.'}
                </p>
                <div className={styles.tags}>
                  {r.tags.map(t => (
                    <span key={t.tag.name} className={styles.tag}>#{t.tag.name}</span>
                  ))}
                </div>
                {r.rank && (
                  <div className={styles.rankBadge}>
                    Relevance: {r.rank.toFixed(2)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
