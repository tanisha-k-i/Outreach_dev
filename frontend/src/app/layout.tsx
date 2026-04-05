import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import styles from "./layout.module.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Resource Search",
  description: "Advanced semantic search for campus resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className={styles.header}>
          <div className="container">
            <nav className={styles.nav}>
              <Link href="/" className={styles.logo}>
                <span className="gradient-text">Campus</span>Search
              </Link>
              <div className={styles.links}>
                <Link href="/" className={styles.link}>Search</Link>
                <Link href="/upload" className={styles.link}>Upload</Link>
                <Link href="/login" className={`${styles.link} ${styles.primaryBtn}`}>Login / Profile</Link>
              </div>
            </nav>
          </div>
        </header>
        <main className={styles.main}>
          {children}
        </main>
      </body>
    </html>
  );
}
