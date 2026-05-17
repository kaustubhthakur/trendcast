"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";
import logo from "../../images/logo.png";

export default function Header() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  // Get initials for avatar
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "";

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src={logo}
            alt="FootBuzz"
            height={60}
            priority
            className={styles.logoImg}
          />
          <span className={styles.logoText}>FootBuzz</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="#dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="#about" className={styles.navLink}>About</Link>
        </nav>

        {/* Desktop Actions */}
        <div className={styles.actions}>
          {user ? (
            <>
              <span className={styles.userGreeting}>
                <span className={styles.userAvatar}>{initials}</span>
                {user.username}
              </span>
              <button
                className={styles.btnLogout}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={styles.btnGhost}>Sign in</Link>
              <Link href="/auth/register" className={styles.btnGold}>Get started</Link>
            </>
          )}
        </div>

        {/* Mobile Burger */}
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}>
        <Link href="/" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="#features" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Features</Link>
        <Link href="#about" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>About</Link>
        <div className={styles.drawerDivider} />
        {user ? (
          <>
            <span className={styles.drawerUser}>
              <span className={styles.userAvatar}>{initials}</span>
              {user.username}
            </span>
            <button className={styles.drawerLogout} onClick={handleLogout}>
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link href="/auth/register" className={`${styles.drawerLink} ${styles.drawerHighlight}`} onClick={() => setMenuOpen(false)}>Get started</Link>
          </>
        )}
      </div>
    </header>
  );
}