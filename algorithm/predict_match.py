import pandas as pd
from sklearn.linear_model import LogisticRegression

# load features data
df = pd.read_csv("features.csv")

# train model again (simple way)
X = df[["home_avg_goals", "away_avg_goals", "goal_diff"]]
y = df["result"]

model = LogisticRegression(max_iter=1000)
model.fit(X, y)


# 🔥 FUNCTION: predict match
def predict_match(home_team, away_team):
    # get latest stats for both teams
    home_data = df[df["HomeTeam"] == home_team].iloc[-1]
    away_data = df[df["AwayTeam"] == away_team].iloc[-1]

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

    # winner
    outcome = ["Home Win", "Draw", "Away Win"]
    print("Prediction:", outcome[probs.argmax()])


# 🔥 TEST
predict_match("Man City", "Arsenal")