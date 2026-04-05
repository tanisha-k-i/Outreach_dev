"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../page.module.css"; 

type Resource = {
  id: string;
  title: string;
  type: string;
  subject: string;
  description: string;
  tags: { tag: { name: string } }[];
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [activeTab, setActiveTab] = useState<"uploads" | "saved">("uploads");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      router.push("/login");
      return;
    }

    fetchTabResources(token, "uploads");
  }, []);

  const fetchTabResources = async (token: string, tab: "uploads" | "saved") => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/user/${tab}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setResources(await res.json());
      } else {
        setResources([]);
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      }
    } catch (e) {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "uploads" | "saved") => {
    setActiveTab(tab);
    const token = localStorage.getItem("token");
    if (token) fetchTabResources(token, tab);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="container" style={{ padding: "4rem" }}>Loading profile...</div>;

  return (
    <div className="container" style={{ paddingBottom: "5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "4rem", marginBottom: "3rem" }}>
        <div>
          <h1 className={styles.title} style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Welcome, {user.name}</h1>
          <p className={styles.subtitle} style={{ marginBottom: 0 }}>{user.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: "0.5rem 1rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
        <button 
          onClick={() => handleTabChange("uploads")}
          style={{ padding: "1rem 2rem", background: "none", border: "none", borderBottom: activeTab === "uploads" ? "2px solid var(--primary)" : "2px solid transparent", color: activeTab === "uploads" ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem", fontWeight: 600 }}
        >
          My Uploads
        </button>
        <button 
          onClick={() => handleTabChange("saved")}
          style={{ padding: "1rem 2rem", background: "none", border: "none", borderBottom: activeTab === "saved" ? "2px solid var(--primary)" : "2px solid transparent", color: activeTab === "saved" ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem", fontWeight: 600 }}
        >
          Saved Resources
        </button>
      </div>

      {loading ? (
        <p>Loading your {activeTab}...</p>
      ) : resources.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No {activeTab} yet</h2>
          <p>You haven't {activeTab === "uploads" ? "uploaded" : "saved"} any resources.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {resources.map((r) => (
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
                  {r.tags && r.tags.map(t => (
                    <span key={t.tag.name} className={styles.tag}>#{t.tag.name}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
