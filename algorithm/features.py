import pandas as pd

df = pd.read_csv("combined.csv")

# sort by date (IMPORTANT)
df = df.sort_values(by="Date")

# rolling averages (simple version)
df["home_avg_goals"] = df["FTHG"].rolling(5).mean()
df["away_avg_goals"] = df["FTAG"].rolling(5).mean()

# difference feature
df["goal_diff"] = df["home_avg_goals"] - df["away_avg_goals"]

# convert result to numbers
df["result"] = df["FTR"].map({"H": 0, "D": 1, "A": 2})

# remove NaN rows
df = df.dropna()

# save
df.to_csv("features.csv", index=False)

print("✅ Features created → features.csv")