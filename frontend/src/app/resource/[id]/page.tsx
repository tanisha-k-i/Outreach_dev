"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useParams } from "next/navigation";
import Link from "next/link";

type Resource = {
  id: string;
  title: string;
  type: string;
  subject: string;
  description: string;
  file_url: string;
  external_url: string;
  created_at: string;
  tags: { tag: { name: string } }[];
};

export default function ResourcePage() {
  const { id } = useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setLoggedIn(!!storedToken);
    fetch(`http://localhost:3002/api/resources/${id}`)
      .then(res => res.json())
      .then(data => {
        setResource(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Check saved status if logged in
    if (token) {
      fetch(`http://localhost:3002/api/user/saved/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setIsSaved(data.saved))
      .catch(console.error);
    }
  }, [id]);

  const handleSaveToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:3002/api/user/saved/${id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setIsSaved(data.saved);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>Loading resource...</div>;
  if (!resource) return <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>Resource not found.</div>;

  return (
    <div className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <Link href="/" className={styles.backLink}>&larr; Back to Search</Link>

      <div className={styles.contentWrapper}>
        <div className={styles.mainInfo}>
          <div className={styles.headerMeta}>
            <span className={styles.badge}>{resource.type}</span>
            <span className={styles.subject}>{resource.subject}</span>
          </div>
          <h1 className={styles.title}>{resource.title}</h1>
          
          <div className={styles.tags}>
            {resource.tags.map(t => (
              <span key={t.tag.name} className={styles.tag}>#{t.tag.name}</span>
            ))}
          </div>

          <div className={styles.descriptionSection}>
            <h3>About this resource</h3>
            <p>{resource.description || "No description provided by the uploader."}</p>
          </div>

          <div className={styles.actionSection}>
            {resource.type === "PDF" && resource.file_url ? (
              <a 
                href={`http://localhost:3002/uploads/${resource.file_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.primaryAction}
              >
                View / Download PDF
              </a>
            ) : (
              <a 
                href={resource.external_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.primaryAction}
              >
                Visit External Link
              </a>
            )}

            {loggedIn && (
              <button 
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={styles.secondaryAction}
                style={{ marginLeft: "1rem" }}
              >
                {isSaving ? "Updating..." : isSaved ? "★ Saved" : "☆ Save Resource"}
              </button>
            )}
          </div>
        </div>

        {resource.type === "PDF" && resource.file_url && (
          <div className={styles.previewSection}>
            <div className={styles.previewPlaceholder}>
              PDF Preview Available 
              <br/>
              <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>(Click view to open full document)</span>
            </div>
            <iframe 
              src={`http://localhost:3002/uploads/${resource.file_url}#toolbar=0`} 
              className={styles.iframePreview}
              title="PDF Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
