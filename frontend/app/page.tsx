"use client";

import Header from "../components/header/Header";
import MatchList from "../components/matches/MatchList";
import { useAuth } from "../context/AuthContext";
import styles from "./page.module.css";

// Remove user entirely:
export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.heroSection}>
          <p className={styles.heroEyebrow}>Premier League · AI Predictions</p>
          <h1 className={styles.heroTitle}>
            Predict. <span>Vote.</span> Win.
          </h1>
          
        </div>
        <MatchList /> 
      </main>
    </>
  );
}