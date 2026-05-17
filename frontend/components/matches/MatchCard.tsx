"use client";

import { useState } from "react";
import styles from "./MatchCard.module.css";
import { useAuth } from "../../context/AuthContext";
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

interface MatchCardProps {
  match: Match;
  user: User | null;
}

export default function MatchCard({ match }: MatchCardProps) {
   const { user } = useAuth();
    const [votes, setVotes] = useState({
    vote_team_a: match.vote_team_a,
    vote_draw: match.vote_draw,
    vote_team_b: match.vote_team_b,
  });
  const [userVote, setUserVote] = useState<"TEAM_A" | "DRAW" | "TEAM_B" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalVotes = votes.vote_team_a + votes.vote_draw + votes.vote_team_b || 1;
  const pctA = Math.round((votes.vote_team_a / totalVotes) * 100);
  const pctDraw = Math.round((votes.vote_draw / totalVotes) * 100);
  const pctB = 100 - pctA - pctDraw;

  const matchDate = new Date(match.match_time);
  const formattedDate = matchDate.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
  const formattedTime = matchDate.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });

  const handleVote = async (voteType: "TEAM_A" | "DRAW" | "TEAM_B") => {
    if (!user) {
      setError("Login to vote");
      return;
    }
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:8081/match/matches/${match.id}/vote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ voteType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Vote failed");
        return;
      }

      if (data.data?.alreadyVoted) {
        setError("Already voted for this option");
        return;
      }

      setVotes({
        vote_team_a: data.data.vote_team_a,
        vote_draw: data.data.vote_draw,
        vote_team_b: data.data.vote_team_b,
      });
      setUserVote(voteType);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const getPredictedLabel = () => {
    if (match.predicted_result === "TEAM_A") return match.team_a_name;
    if (match.predicted_result === "TEAM_B") return match.team_b_name;
    return "Draw";
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.dateTag}>
          {formattedDate} · {formattedTime}
        </span>
       <span className={styles.predictionTag}>
  AI Pick: <strong>{getPredictedLabel()}</strong>
  <span className={styles.scoreline}>
    {match.team_a_goals}–{match.team_b_goals}
  </span>
</span>
      </div>

      <div className={styles.teamsRow}>
        <div className={styles.team}>
          <div className={styles.logoWrap}>
            {match.team_a_logo ? (
              <img src={match.team_a_logo} alt={match.team_a_name} className={styles.logo} />
            ) : (
              <div className={styles.logoPlaceholder}>{match.team_a_name[0]}</div>
            )}
          </div>
          <span className={styles.teamName}>{match.team_a_name}</span>
          <span className={styles.prob}>{Math.round(match.team_a_win_prob)}%</span>
        </div>

        <div className={styles.vs}>
          <span>VS</span>
          <span className={styles.drawProb}>{Math.round(match.draw_prob)}% Draw</span>
        </div>

        <div className={`${styles.team} ${styles.teamRight}`}>
          <div className={styles.logoWrap}>
            {match.team_b_logo ? (
              <img src={match.team_b_logo} alt={match.team_b_name} className={styles.logo} />
            ) : (
              <div className={styles.logoPlaceholder}>{match.team_b_name[0]}</div>
            )}
          </div>
          <span className={styles.teamName}>{match.team_b_name}</span>
          <span className={styles.prob}>{Math.round(match.team_b_win_prob)}%</span>
        </div>
      </div>

      <div className={styles.probBar}>
        <div className={styles.probSegA} style={{ width: `${Math.round(match.team_a_win_prob)}%` }} />
        <div className={styles.probSegDraw} style={{ width: `${Math.round(match.draw_prob)}%` }} />
        <div className={styles.probSegB} style={{ width: `${Math.round(match.team_b_win_prob)}%` }} />
      </div>

      <div className={styles.voteSection}>
        <p className={styles.voteLabel}>Who do you think wins?</p>

        <div className={styles.voteButtons}>
          <button
            className={`${styles.voteBtn} ${styles.voteBtnA} ${userVote === "TEAM_A" ? styles.voted : ""}`}
            onClick={() => handleVote("TEAM_A")}
            disabled={loading}
          >
            <span className={styles.voteBtnTeam}>{match.team_a_name}</span>
            <span className={styles.voteBtnPct}>{pctA}%</span>
          </button>

          <button
            className={`${styles.voteBtn} ${styles.voteBtnDraw} ${userVote === "DRAW" ? styles.voted : ""}`}
            onClick={() => handleVote("DRAW")}
            disabled={loading}
          >
            <span className={styles.voteBtnTeam}>Draw</span>
            <span className={styles.voteBtnPct}>{pctDraw}%</span>
          </button>

          <button
            className={`${styles.voteBtn} ${styles.voteBtnB} ${userVote === "TEAM_B" ? styles.voted : ""}`}
            onClick={() => handleVote("TEAM_B")}
            disabled={loading}
          >
            <span className={styles.voteBtnTeam}>{match.team_b_name}</span>
            <span className={styles.voteBtnPct}>{pctB}%</span>
          </button>
        </div>

        <div className={styles.voteBar}>
          <div className={styles.voteSegA} style={{ width: `${pctA}%` }} title={`${match.team_a_name}: ${pctA}%`} />
          <div className={styles.voteSegDraw} style={{ width: `${pctDraw}%` }} title={`Draw: ${pctDraw}%`} />
          <div className={styles.voteSegB} style={{ width: `${pctB}%` }} title={`${match.team_b_name}: ${pctB}%`} />
        </div>

        <p className={styles.totalVotes}>
          {votes.vote_team_a + votes.vote_draw + votes.vote_team_b} community votes
        </p>

        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>
    </article>
  );
}