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
  league?: "PL" | "LALIGA" | "UCL";
}

type FilterType = "all" | "today" | "upcoming";
type LeagueType = "ALL" | "PL" | "LALIGA" | "UCL";

const LEAGUE_LABELS: Record<LeagueType, string> = {
  ALL: "All Leagues",
  PL: "Premier League",
  LALIGA: "La Liga",
  UCL: "UCL",
};

export default function MatchList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [league, setLeague] = useState<LeagueType>("ALL");

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
    if (league !== "ALL" && m.league !== league) return false;

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
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <section className={styles.section}>

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Date</span>
          <div className={styles.pillGroup}>
            {(["all", "today", "upcoming"] as FilterType[]).map((f) => (
              <button
                key={f}
                className={`${styles.pill} ${filter === f ? styles.pillActive : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "today" ? "Today" : "Upcoming"}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>League</span>
          <div className={styles.pillGroup}>
            {(["ALL", "PL", "LALIGA", "UCL"] as LeagueType[]).map((l) => (
              <button
                key={l}
                className={`${styles.pill} ${league === l ? styles.pillActive : ""}`}
                onClick={() => setLeague(l)}
              >
                {l === "ALL" ? "All" : l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className={styles.stateWrap}>
          <div className={styles.skeletonGrid}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={styles.skeletonCard}
                style={{ animationDelay: `${i * 0.12}s` }}
              />
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
          <div className={styles.dateHeadingRow}>
            <h2 className={styles.dateHeading}>{date}</h2>
            <span className={styles.matchCount}>
              {dayMatches.length} {dayMatches.length === 1 ? "match" : "matches"}
            </span>
          </div>
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