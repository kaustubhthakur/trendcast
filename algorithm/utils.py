import pandas as pd
import os
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

df = pd.read_csv(
    os.path.join(BASE_DIR, "features.csv")
)

FEATURE_COLS = [

    "home_win_rate",
    "away_win_rate",

    "home_scored",
    "away_scored",

    "home_conceded",
    "away_conceded",

    "home_attack_vs_away_defense",
    "away_attack_vs_home_defense"
]

LEAGUE_HOME_GOALS = df["FTHG"].mean()

LEAGUE_AWAY_GOALS = df["FTAG"].mean()


def weighted_average(values):

    weights = np.arange(
        1,
        len(values) + 1
    )

    return np.average(
        values,
        weights=weights
    )


def get_team_stats(team, last_n=12):

    home_matches = (
        df[df["HomeTeam"] == team]
        .tail(last_n)
    )

    away_matches = (
        df[df["AwayTeam"] == team]
        .tail(last_n)
    )

    if len(home_matches) < 5 or len(away_matches) < 5:
        return None

    h_scored = weighted_average(
        home_matches["FTHG"]
    )

    h_conceded = weighted_average(
        home_matches["FTAG"]
    )

    a_scored = weighted_average(
        away_matches["FTAG"]
    )

    a_conceded = weighted_average(
        away_matches["FTHG"]
    )

    home_attack = (
        h_scored / LEAGUE_HOME_GOALS
    )

    away_attack = (
        a_scored / LEAGUE_AWAY_GOALS
    )

    home_defense = (
        h_conceded / LEAGUE_AWAY_GOALS
    )

    away_defense = (
        a_conceded / LEAGUE_HOME_GOALS
    )

    home_clean_sheets = (
        (home_matches["FTAG"] == 0)
        .mean()
    )

    away_clean_sheets = (
        (away_matches["FTHG"] == 0)
        .mean()
    )

    home_big_scoring = (
        (home_matches["FTHG"] >= 3)
        .mean()
    )

    away_big_scoring = (
        (away_matches["FTAG"] >= 3)
        .mean()
    )

    recent_matches = pd.concat([
        home_matches,
        away_matches
    ]).tail(5)

    points = 0

    for _, row in recent_matches.iterrows():

        if row["HomeTeam"] == team:

            if row["FTHG"] > row["FTAG"]:
                points += 3

            elif row["FTHG"] == row["FTAG"]:
                points += 1

        else:

            if row["FTAG"] > row["FTHG"]:
                points += 3

            elif row["FTAG"] == row["FTHG"]:
                points += 1

    form = points / 15

    return {

        "home_attack": home_attack,
        "away_attack": away_attack,

        "home_defense": home_defense,
        "away_defense": away_defense,

        "home_clean_sheets":
            home_clean_sheets,

        "away_clean_sheets":
            away_clean_sheets,

        "home_big_scoring":
            home_big_scoring,

        "away_big_scoring":
            away_big_scoring,

        "form": form,

        "season":
            home_matches.iloc[-1]["season"]
    }