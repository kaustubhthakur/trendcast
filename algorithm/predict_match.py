import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression

# ==============================
# LOAD DATA + TRAIN MODEL
# ==============================
df = pd.read_csv("features.csv")

X = df[["home_avg_goals", "away_avg_goals", "goal_diff"]]
y = df["result"]

model = LogisticRegression(max_iter=1000)
model.fit(X, y)

# ==============================
# TEAM NAME MAPPING (IMPORTANT)
# ==============================
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
    home_df = df[df["HomeTeam"] == home_team]
    away_df = df[df["AwayTeam"] == away_team]

    if home_df.empty or away_df.empty:
        print(f"Skipping {home_team} vs {away_team} (data not found)")
        return

    home_data = home_df.iloc[-1]
    away_data = away_df.iloc[-1]

    home_avg = home_data["home_avg_goals"]
    away_avg = away_data["away_avg_goals"]
    goal_diff = home_avg - away_avg

    sample = pd.DataFrame(
        [[home_avg, away_avg, goal_diff]],
        columns=["home_avg_goals", "away_avg_goals", "goal_diff"]
    )

    probs = model.predict_proba(sample)[0]

    print(f"\n{home_team} vs {away_team}")
    print(f"{home_team} Win: {probs[0]*100:.2f}%")
    print(f"Draw: {probs[1]*100:.2f}%")
    print(f"{away_team} Win: {probs[2]*100:.2f}%")

    outcome = ["Home Win", "Draw", "Away Win"]
    print("Prediction:", outcome[probs.argmax()])


API_KEY = "Api key"

url = "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED"

headers = {
    "X-Auth-Token": API_KEY
}

response = requests.get(url, headers=headers)
data = response.json()

# ==============================
# RUN PREDICTIONS ON REAL MATCHES
# ==============================
print("\n🔥 Upcoming Match Predictions 🔥")

for m in data.get("matches", [])[:10]:
    home = m["homeTeam"]["name"]
    away = m["awayTeam"]["name"]

    # map API names to dataset names
    home = team_map.get(home, home)
    away = team_map.get(away, away)

    predict_match(home, away)