import pandas as pd

df = pd.read_csv("combined.csv")
df = df.sort_values(by="Date")

df["home_avg_goals"] = df["FTHG"].rolling(5).mean()
df["away_avg_goals"] = df["FTAG"].rolling(5).mean()


df["goal_diff"] = df["home_avg_goals"] - df["away_avg_goals"]

df["result"] = df["FTR"].map({"H": 0, "D": 1, "A": 2})

df = df.dropna()

df.to_csv("features.csv", index=False)

print("✅ Features created → features.csv")