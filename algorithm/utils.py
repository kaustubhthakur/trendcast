# algorithm/utils.py

import pandas as pd

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "features.csv")

df = pd.read_csv(csv_path)

_team_stats_cache = {}

FEATURE_COLS = [
    "home_win_rate", "away_win_rate",
    "home_avg_goals_scored", "away_avg_goals_scored",
    "home_avg_goals_conceded", "away_avg_goals_conceded",
    "home_attack_edge", "away_attack_edge"
]

def get_team_stats(team):
    if team in _team_stats_cache:
        return _team_stats_cache[team]

    home_matches = df[df["HomeTeam"] == team]
    away_matches = df[df["AwayTeam"] == team]

    total = len(home_matches) + len(away_matches)
    if total == 0:
        return None

    wins = (home_matches["result"] == 0).sum() + \
           (away_matches["result"] == 2).sum()

    win_rate = wins / total

    scored = (home_matches["home_avg_goals"].mean() +
              away_matches["away_avg_goals"].mean()) / 2

    conceded = (home_matches["away_avg_goals"].mean() +
                away_matches["home_avg_goals"].mean()) / 2

    result = (win_rate, scored, conceded)
    _team_stats_cache[team] = result
    return result