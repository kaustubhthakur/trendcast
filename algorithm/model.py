import pandas as pd
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.preprocessing import StandardScaler
import os

from utils import (
    get_team_stats,
    FEATURE_COLS
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

df = pd.read_csv(
    os.path.join(BASE_DIR, "features.csv")
)

features = []
labels = []

home_goals = []
away_goals = []

for _, row in df.iterrows():

    home = row["HomeTeam"]
    away = row["AwayTeam"]

    home_stats = get_team_stats(home)
    away_stats = get_team_stats(away)

    if home_stats is None or away_stats is None:
        continue

    h_win = home_stats["form"]
    a_win = away_stats["form"]

    h_scored = home_stats["home_attack"]
    a_scored = away_stats["away_attack"]

    h_conceded = home_stats["home_defense"]
    a_conceded = away_stats["away_defense"]

    features.append([

        h_win,
        a_win,

        h_scored,
        a_scored,

        h_conceded,
        a_conceded,

        h_scored - a_conceded,
        a_scored - h_conceded
    ])

    labels.append(row["result"])

    if "home_goals" in row:
        home_goals.append(row["home_goals"])
    else:
        home_goals.append(row["home_avg_goals"])

    if "away_goals" in row:
        away_goals.append(row["away_goals"])
    else:
        away_goals.append(row["away_avg_goals"])

X = pd.DataFrame(
    features,
    columns=FEATURE_COLS
)

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

outcome_model = LogisticRegression(
    max_iter=1000
)

outcome_model.fit(
    X_scaled,
    labels
)

home_goals_model = Ridge(
    alpha=0.5
)

away_goals_model = Ridge(
    alpha=0.5
)

home_goals_model.fit(
    X_scaled,
    home_goals
)

away_goals_model.fit(
    X_scaled,
    away_goals
)
