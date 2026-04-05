"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./layout.module.css";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Check initial state
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      setIsLoggedIn(!!token);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name?.split(' ')[0] || "Profile");
        } catch(e) {}
      }
    };

    checkLogin();

    // Listen for cross-tab or component storage events
    window.addEventListener("storage", checkLogin);
    
    // Also set up an interval as a fallback for same-tab React router changes
    // since localStorage events don't fire in the same tab that triggered them.
    const interval = setInterval(checkLogin, 500);

    return () => {
      window.removeEventListener("storage", checkLogin);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            <span className="gradient-text">Campus</span>Search
          </Link>
          <div className={styles.links}>
            <Link href="/" className={styles.link}>Search</Link>
            <Link href="/upload" className={styles.link}>Upload</Link>
            {isLoggedIn ? (
              <Link href="/profile" className={`${styles.link} ${styles.primaryBtn}`}>
                {userName}
              </Link>
            ) : (
              <Link href="/login" className={`${styles.link} ${styles.primaryBtn}`}>
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
