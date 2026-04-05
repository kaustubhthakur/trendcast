import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.preprocessing import StandardScaler
import numpy as np

df = pd.read_csv("features.csv")

_team_stats_cache = {}

def get_team_stats(team):
    if team in _team_stats_cache:
        return _team_stats_cache[team]

    home_matches = df[df["HomeTeam"] == team]
    away_matches = df[df["AwayTeam"] == team]
    total_matches = len(home_matches) + len(away_matches)

    if total_matches == 0:
        return None

    home_wins = (home_matches["result"] == 0).sum()
    away_wins = (away_matches["result"] == 2).sum()
    wins = home_wins + away_wins
    win_rate = wins / total_matches

    home_goals = home_matches["home_avg_goals"].mean() if len(home_matches) > 0 else 0
    away_goals = away_matches["away_avg_goals"].mean() if len(away_matches) > 0 else 0
    avg_goals_scored = (home_goals + away_goals) / 2

    home_conceded = home_matches["away_avg_goals"].mean() if len(home_matches) > 0 else 0
    away_conceded = away_matches["home_avg_goals"].mean() if len(away_matches) > 0 else 0
    avg_goals_conceded = (home_conceded + away_conceded) / 2

    result = (win_rate, avg_goals_scored, avg_goals_conceded)
    _team_stats_cache[team] = result
    return result

features = []
labels = []
home_goals_actual = []
away_goals_actual = []

for _, row in df.iterrows():
    home = row["HomeTeam"]
    away = row["AwayTeam"]

    home_stats = get_team_stats(home)
    away_stats = get_team_stats(away)

    if home_stats is None or away_stats is None:
        continue

    home_win, home_goals_scored, home_goals_conceded = home_stats
    away_win, away_goals_scored, away_goals_conceded = away_stats

    features.append([
        home_win, away_win,
        home_goals_scored, away_goals_scored,
        home_goals_conceded, away_goals_conceded,
        home_goals_scored - away_goals_conceded,  
        away_goals_scored - home_goals_conceded, 
    ])
    labels.append(row["result"])

    home_goals_actual.append(row.get("home_goals", row["home_avg_goals"]))
    away_goals_actual.append(row.get("away_goals", row["away_avg_goals"]))

FEATURE_COLS = [
    "home_win_rate", "away_win_rate",
    "home_avg_goals_scored", "away_avg_goals_scored",
    "home_avg_goals_conceded", "away_avg_goals_conceded",
    "home_attack_edge", "away_attack_edge"
]

X = pd.DataFrame(features, columns=FEATURE_COLS)
y = labels

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

outcome_model = LogisticRegression(max_iter=1000, C=1.0)
outcome_model.fit(X_scaled, y)

home_goals_model = Ridge(alpha=1.0)
away_goals_model = Ridge(alpha=1.0)

home_goals_model.fit(X_scaled, home_goals_actual)
away_goals_model.fit(X_scaled, away_goals_actual)

team_map = {
    "Manchester City FC": "Man City",
    "Arsenal FC": "Arsenal",
    "Chelsea FC": "Chelsea",
    "Liverpool FC": "Liverpool",
    "Tottenham Hotspur FC": "Tottenham",
    "Manchester United FC": "Man United",
    "Newcastle United FC": "Newcastle",
    "West Ham United FC": "West Ham",
    "Wolverhampton Wanderers FC": "Wolves",
    "Brighton & Hove Albion FC": "Brighton",
    "Nottingham Forest FC": "Forest",
    "Leeds United FC": "Leeds",
    "AFC Bournemouth": "Bournemouth",
    "Burnley FC": "Burnley",
    "Everton FC": "Everton",
    "Fulham FC": "Fulham",
    "Crystal Palace FC": "Crystal Palace",
    "Aston Villa FC": "Aston Villa",
    "Brentford FC": "Brentford",
    "Sunderland AFC": "Sunderland"
}

def predict_match(home_team, away_team):
    home_stats = get_team_stats(home_team)
    away_stats = get_team_stats(away_team)

    if home_stats is None or away_stats is None:
        print(f"⚠️  No data for: {home_team} vs {away_team} — skipping.")
        return

    home_win, home_goals_scored, home_goals_conceded = home_stats
    away_win, away_goals_scored, away_goals_conceded = away_stats

    sample_raw = [[
        home_win, away_win,
        home_goals_scored, away_goals_scored,
        home_goals_conceded, away_goals_conceded,
        home_goals_scored - away_goals_conceded,
        away_goals_scored - home_goals_conceded,
    ]]

    sample_scaled = scaler.transform(sample_raw)

    probs = outcome_model.predict_proba(sample_scaled)[0]

    pred_home_goals = max(0.0, home_goals_model.predict(sample_scaled)[0])
    pred_away_goals = max(0.0, away_goals_model.predict(sample_scaled)[0])

    outcome_labels = ["Home Win", "Draw", "Away Win"]
    predicted_outcome = outcome_labels[np.argmax(probs)]

    bar = "─" * 42
    print(f"\n┌{bar}┐")
    print(f"│  ⚽  {home_team:<17} vs  {away_team:<14}│")
    print(f"├{bar}┤")
    print(f"│  🏠 {home_team} Win :  {probs[0]*100:5.1f}%{' '*16}│")
    print(f"│  🤝 Draw          :  {probs[1]*100:5.1f}%{' '*16}│")
    print(f"│  ✈️  {away_team} Win :  {probs[2]*100:5.1f}%{' '*15}│")
    print(f"├{bar}┤")
    print(f"│  🎯 Predicted Score :  {pred_home_goals:.1f}  –  {pred_away_goals:.1f}{' '*12}│")
    print(f"│  📊 Prediction      :  {predicted_outcome:<20}│")
    print(f"└{bar}┘")

API_KEY = "Token"
url = "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED"
headers = {"X-Auth-Token": API_KEY}

response = requests.get(url, headers=headers)
data = response.json()

print("\n" + "=" * 44)
print("    🔥  PREMIER LEAGUE PREDICTIONS  🔥")
print("=" * 44)

for m in data.get("matches", [])[:10]:
    home = team_map.get(m["homeTeam"]["name"], m["homeTeam"]["name"])
    away = team_map.get(m["awayTeam"]["name"], m["awayTeam"]["name"])
    predict_match(home, away)