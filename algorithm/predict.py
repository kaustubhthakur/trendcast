import pandas as pd
import numpy as np
import sys
import json
from scipy.stats import poisson

from utils import (
    get_team_stats,
    LEAGUE_HOME_GOALS,
    LEAGUE_AWAY_GOALS
)

MAX_GOALS = 15


def poisson_matrix(home_xg, away_xg):

    matrix = np.zeros((MAX_GOALS + 1, MAX_GOALS + 1))

    for i in range(MAX_GOALS + 1):
        for j in range(MAX_GOALS + 1):

            matrix[i][j] = (
                poisson.pmf(i, home_xg)
                * poisson.pmf(j, away_xg)
            )

    return matrix


def top_scorelines(matrix, top_n=5):

    scores = []

    for i in range(MAX_GOALS + 1):
        for j in range(MAX_GOALS + 1):

            scores.append({
                "score": f"{i}-{j}",
                "probability": matrix[i][j]
            })

    scores = sorted(
        scores,
        key=lambda x: x["probability"],
        reverse=True
    )

    return [
        {
            "score": s["score"],
            "probability": round(s["probability"] * 100, 2)
        }
        for s in scores[:top_n]
    ]


def predict(home, away):

    home_stats = get_team_stats(home)
    away_stats = get_team_stats(away)

    if not home_stats or not away_stats:
        return {"error": "Not enough data"}

    # BASE EXPECTED GOALS

    home_xg = (
        home_stats["home_attack"]
        * away_stats["away_defense"]
        * LEAGUE_HOME_GOALS
    )

    away_xg = (
        away_stats["away_attack"]
        * home_stats["home_defense"]
        * LEAGUE_AWAY_GOALS
    )

    # FORM BOOST

    home_xg *= (0.85 + home_stats["form"] * 0.35)
    away_xg *= (0.85 + away_stats["form"] * 0.35)

    # BIG SCORING BOOST

    home_xg *= (
        1 + home_stats["home_big_scoring"] * 0.18
    )

    away_xg *= (
        1 + away_stats["away_big_scoring"] * 0.18
    )

    # CLEAN SHEET REDUCTION

    home_xg *= (
        1 - away_stats["away_clean_sheets"] * 0.15
    )

    away_xg *= (
        1 - home_stats["home_clean_sheets"] * 0.15
    )

    # HOME ADVANTAGE

    home_xg *= 1.10

    # CONTROLLED VARIANCE

    home_xg += np.random.normal(0, 0.12)
    away_xg += np.random.normal(0, 0.12)

    # REALISTIC LIMITS

    home_xg = max(0.2, min(home_xg, 5.5))
    away_xg = max(0.2, min(away_xg, 5.5))

    # POISSON SCORE MATRIX

    matrix = poisson_matrix(home_xg, away_xg)

    home_prob = 0
    draw_prob = 0
    away_prob = 0

    best_prob = 0
    best_score = (0, 0)

    for i in range(MAX_GOALS + 1):
        for j in range(MAX_GOALS + 1):

            prob = matrix[i][j]

            if i > j:
                home_prob += prob

            elif i == j:
                draw_prob += prob

            else:
                away_prob += prob

            if prob > best_prob:
                best_prob = prob
                best_score = (i, j)

    total = (
        home_prob
        + draw_prob
        + away_prob
    )

    home_prob = (home_prob / total) * 100
    draw_prob = (draw_prob / total) * 100
    away_prob = (away_prob / total) * 100

    return {

        "teamAWinProb": round(home_prob, 2),

        "drawProb": round(draw_prob, 2),

        "teamBWinProb": round(away_prob, 2),

        "teamAGoals": round(home_xg, 2),

        "teamBGoals": round(away_xg, 2),

        "predictedScore":
            f"{best_score[0]}-{best_score[1]}",

        "topScorelines":
            top_scorelines(matrix, 5)
    }


if __name__ == "__main__":

    print(
        json.dumps(
            predict(sys.argv[1], sys.argv[2]),
            indent=4
        )
    )