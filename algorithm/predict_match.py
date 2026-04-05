import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("features.csv")


def get_team_stats(team):
    home_matches = df[df["HomeTeam"] == team]
    away_matches = df[df["AwayTeam"] == team]

    total_matches = len(home_matches) + len(away_matches)
    if total_matches == 0:
        return None

    home_wins = (home_matches["result"] == 0).sum()
    away_wins = (away_matches["result"] == 2).sum()
    wins = home_wins + away_wins

    win_rate = wins / total_matches

    home_goals = home_matches["home_avg_goals"].mean()
    away_goals = away_matches["away_avg_goals"].mean()

    avg_goals = (home_goals + away_goals) / 2

    return win_rate, avg_goals

features = []
labels = []

teams = pd.concat([df["HomeTeam"], df["AwayTeam"]]).unique()

for _, row in df.iterrows():
    home = row["HomeTeam"]
    away = row["AwayTeam"]

    home_stats = get_team_stats(home)
    away_stats = get_team_stats(away)

    if home_stats is None or away_stats is None:
        continue

    home_win, home_goals = home_stats
    away_win, away_goals = away_stats

    features.append([home_win, away_win, home_goals, away_goals])
    labels.append(row["result"])

X = pd.DataFrame(features, columns=[
    "home_win_rate", "away_win_rate",
    "home_avg_goals", "away_avg_goals"
])

y = labels

model = LogisticRegression(max_iter=1000)
model.fit(X, y)


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
        print(f"Skipping {home_team} vs {away_team}")
        return

    home_win, home_goals = home_stats
    away_win, away_goals = away_stats

    sample = pd.DataFrame(
        [[home_win, away_win, home_goals, away_goals]],
        columns=[
            "home_win_rate", "away_win_rate",
            "home_avg_goals", "away_avg_goals"
        ]
    )

    probs = model.predict_proba(sample)[0]

    print(f"\n{home_team} vs {away_team}")
    print(f"{home_team} Win: {probs[0]*100:.2f}%")
    print(f"Draw: {probs[1]*100:.2f}%")
    print(f"{away_team} Win: {probs[2]*100:.2f}%")

    outcome = ["Home Win", "Draw", "Away Win"]
    print("Prediction:", outcome[probs.argmax()])

API_KEY = "API TOKEN"

url = "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED"

headers = {"X-Auth-Token": API_KEY}
data = requests.get(url, headers=headers).json()


print("\n🔥 Improved Predictions 🔥")

for m in data.get("matches", [])[:10]:
    home = team_map.get(m["homeTeam"]["name"], m["homeTeam"]["name"])
    away = team_map.get(m["awayTeam"]["name"], m["awayTeam"]["name"])

    predict_match(home, away)