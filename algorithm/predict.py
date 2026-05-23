import numpy as np
import sys
import json

from scipy.stats import poisson

from utils import (
    get_team_stats,
    LEAGUE_HOME_GOALS,
    LEAGUE_AWAY_GOALS,
)

MAX_GOALS = 15

RHO = -0.13


def _dc_tau(i, j, mu, nu):

    if i == 0 and j == 0:
        return 1.0 - mu * nu * RHO

    elif i == 1 and j == 0:
        return 1.0 + nu * RHO

    elif i == 0 and j == 1:
        return 1.0 + mu * RHO

    elif i == 1 and j == 1:
        return 1.0 - RHO

    return 1.0


def score_matrix(home_xg, away_xg):

    mat = np.zeros(
        (MAX_GOALS + 1, MAX_GOALS + 1)
    )

    for i in range(MAX_GOALS + 1):

        for j in range(MAX_GOALS + 1):

            mat[i, j] = (

                poisson.pmf(i, home_xg)

                * poisson.pmf(j, away_xg)

                * _dc_tau(
                    i,
                    j,
                    home_xg,
                    away_xg
                )
            )

    mat /= mat.sum()

    return mat


def compute_xg(home_stats, away_stats):

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

    home_xg *= (
        0.92 + home_stats["form"] * 0.16
    )

    away_xg *= (
        0.92 + away_stats["form"] * 0.16
    )

    home_xg *= 1.06

    home_xg = max(
        0.50,
        min(home_xg, 2.8)
    )

    away_xg = max(
        0.40,
        min(away_xg, 2.5)
    )

    return (
        round(home_xg, 3),
        round(away_xg, 3)
    )


def outcome_probs(mat):

    n = mat.shape[0]

    home_win = sum(
        mat[i, j]
        for i in range(n)
        for j in range(n)
        if i > j
    )

    draw = sum(
        mat[i, i]
        for i in range(n)
    )

    away_win = sum(
        mat[i, j]
        for i in range(n)
        for j in range(n)
        if j > i
    )

    total = (
        home_win
        + draw
        + away_win
    )

    return (

        round(
            (home_win / total) * 100,
            2
        ),

        round(
            (draw / total) * 100,
            2
        ),

        round(
            (away_win / total) * 100,
            2
        ),
    )


def predicted_score(
    mat,
    home_xg,
    away_xg
):

    n = mat.shape[0]

    best_val = -1

    best_cell = (1, 0)

    xg_ratio = np.log(
        home_xg / away_xg
    )

    for i in range(n):

        for j in range(n):

            score_ratio = np.log(
                (i + 0.5) / (j + 0.5)
            )

            consistency = np.exp(

                -0.8
                * (
                    score_ratio
                    - xg_ratio
                ) ** 2
            )

            val = (
                mat[i, j]
                * consistency
            )

            if val > best_val:

                best_val = val

                best_cell = (i, j)

    return best_cell


def top_scorelines(
    mat,
    top_n=5
):

    n = mat.shape[0]

    scores = [

        {
            "score": f"{i}-{j}",
            "probability": mat[i, j]
        }

        for i in range(n)

        for j in range(n)
    ]

    scores.sort(
        key=lambda x: x["probability"],
        reverse=True
    )

    return [

        {
            "score": s["score"],

            "probability": round(
                s["probability"] * 100,
                2
            )
        }

        for s in scores[:top_n]
    ]


def predict(home, away):

    home_stats = get_team_stats(home)

    away_stats = get_team_stats(away)

    if not home_stats or not away_stats:

        return {
            "error": "Not enough data"
        }

    home_league = (
        "EPL"
        if "E0" in home_stats["season"]
        else "LALIGA"
    )

    away_league = (
        "EPL"
        if "E0" in away_stats["season"]
        else "LALIGA"
    )

    if home_league != away_league:

        return {
            "error":
                "Cross-league predictions disabled"
        }

    home_xg, away_xg = compute_xg(
        home_stats,
        away_stats
    )

    mat = score_matrix(
        home_xg,
        away_xg
    )

    home_prob, draw_prob, away_prob = (
        outcome_probs(mat)
    )

    best = predicted_score(
        mat,
        home_xg,
        away_xg
    )

    return {

        "teamAWinProb":
            home_prob,

        "drawProb":
            draw_prob,

        "teamBWinProb":
            away_prob,

        "teamAGoals":
            home_xg,

        "teamBGoals":
            away_xg,

        "predictedScore":
            f"{best[0]}-{best[1]}",

        "topScorelines":
            top_scorelines(mat, 5),
    }


if __name__ == "__main__":

    print(

        json.dumps(

            predict(
                sys.argv[1],
                sys.argv[2]
            ),

            indent=4
        )
    )