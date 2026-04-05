"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../upload/page.module.css"; // Reuse form styles

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Bypassing real database authentication since no DB is connected for the demo
      const mockToken = "dummy-token";
      const mockUser = { id: "dummy-user-1", name: "Guest User", email: email || "guest@university.edu" };
      
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

      // Trigger a storage event to update navbar state
      window.dispatchEvent(new Event("storage"));
      
      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "6rem", paddingBottom: "4rem" }}>
      <div className={styles.uploadWrapper} style={{ maxWidth: "450px" }}>
        <h1 className={styles.title} style={{ textAlign: "center" }}>Welcome Back</h1>
        <p className={styles.subtitle} style={{ textAlign: "center" }}>Login to your CampusSearch account.</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login (Demo Mode)"}
          </button>

          <p style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Note: Database verification is bypassed for this demo. Any values entered will log you in to explore the frontend.
          </p>

          <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-muted)" }}>
            Don't have an account? <Link href="/register" style={{ color: "var(--primary)" }}>Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
