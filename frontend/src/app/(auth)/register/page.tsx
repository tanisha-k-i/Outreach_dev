"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../upload/page.module.css"; 

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Bypassing real database authentication since no DB is connected for the demo
      const mockToken = "dummy-token";
      const mockUser = { id: "dummy-user-1", name: name || "Guest User", email: email || "guest@university.edu" };
      
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

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
        <h1 className={styles.title} style={{ textAlign: "center" }}>Create Account</h1>
        <p className={styles.subtitle} style={{ textAlign: "center" }}>Join CampusSearch today.</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleRegister} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

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
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Creating account..." : "Sign Up (Demo Mode)"}
          </button>

          <p style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Note: Database verification is bypassed for this demo. Any values entered will log you in to explore the frontend.
          </p>

          <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-muted)" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--primary)" }}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
