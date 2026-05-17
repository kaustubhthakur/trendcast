"use client";

import { useEffect, useState } from "react";
import MatchCard from "./MatchCard";
import styles from "./MatchList.module.css";

interface Match {
  id: string;
  team_a_name: string;
  team_a_logo: string | null;
  team_b_name: string;
  team_b_logo: string | null;
  team_a_win_prob: number;
  draw_prob: number;
  team_b_win_prob: number;
  predicted_result: "TEAM_A" | "DRAW" | "TEAM_B";
  team_a_goals: number;
  team_b_goals: number;
  match_time: string;
  vote_team_a: number;
  vote_draw: number;
  vote_team_b: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}



type FilterType = "all" | "today" | "upcoming";

export default function MatchList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8081/match/matches");
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();
        setMatches(data.data || []);
      } catch {
        setError("Could not load matches. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (filter === "all") return true;
    const matchDate = new Date(m.match_time);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (filter === "today") return matchDate >= today && matchDate < tomorrow;
    if (filter === "upcoming") return matchDate >= tomorrow;
    return true;
  });

  const grouped = filteredMatches.reduce<Record<string, Match[]>>((acc, match) => {
    const date = new Date(match.match_time).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <section className={styles.section}>
      <div className={styles.filterRow}>
        {(["all", "today", "upcoming"] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.stateWrap}>
          <div className={styles.spinnerRow}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeletonCard} style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className={styles.stateWrap}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {!loading && !error && filteredMatches.length === 0 && (
        <div className={styles.stateWrap}>
          <p className={styles.emptyText}>No matches found for this filter.</p>
        </div>
      )}

      {!loading && !error && Object.entries(grouped).map(([date, dayMatches]) => (
        <div key={date} className={styles.dateGroup}>
          <h2 className={styles.dateHeading}>{date}</h2>
          <div className={styles.grid}>
            {dayMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}