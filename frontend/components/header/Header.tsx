"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";

export default function Header() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>⚽</span>
          <span className={styles.logoText}>FootBuzz</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="#features" className={styles.navLink}>Features</Link>
          <Link href="#about" className={styles.navLink}>About</Link>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <>
              <span className={styles.userGreeting}>👋 {user.username}</span>
              <button className={styles.btnLogout} onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? "..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={styles.btnGhost}>Sign in</Link>
              <Link href="/auth/register" className={styles.btnGold}>Register</Link>
            </>
          )}
        </div>

        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}>
        <Link href="/" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="#features" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Features</Link>
        <Link href="#about" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>About</Link>
        <div className={styles.drawerDivider} />
        {user ? (
          <>
            <span className={styles.drawerUser}>👋 {user.username}</span>
            <button className={styles.drawerLogout} onClick={handleLogout}>
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link href="/auth/register" className={`${styles.drawerLink} ${styles.drawerHighlight}`} onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </header>
  );
}