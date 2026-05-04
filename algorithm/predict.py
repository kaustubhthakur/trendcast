import pandas as pd
import sys, json
from model import outcome_model, home_goals_model, away_goals_model, scaler
from utils import get_team_stats, FEATURE_COLS

def predict(home, away):
    home_stats = get_team_stats(home)
    away_stats = get_team_stats(away)

    if not home_stats or not away_stats:
        return {"error": "No data"}

    h_win, h_scored, h_conceded = home_stats
    a_win, a_scored, a_conceded = away_stats

    sample = pd.DataFrame([[
        h_win, a_win,
        h_scored, a_scored,
        h_conceded, a_conceded,
        h_scored - a_conceded,
        a_scored - h_conceded
    ]], columns=FEATURE_COLS)

    X = scaler.transform(sample)

    probs = outcome_model.predict_proba(X)[0]

    # ✅ FIX: no rounding here
    home_goals = max(0, home_goals_model.predict(X)[0])
    away_goals = max(0, away_goals_model.predict(X)[0])

    # ✅ small home advantage bias
    home_goals += 0.2

    return {
        "teamAWinProb": float(probs[0] * 100),
        "drawProb": float(probs[1] * 100),
        "teamBWinProb": float(probs[2] * 100),
        "teamAGoals": float(home_goals),
        "teamBGoals": float(away_goals)
    }

if __name__ == "__main__":
    print(json.dumps(predict(sys.argv[1], sys.argv[2])))