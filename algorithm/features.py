import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

combined_path = os.path.join(BASE_DIR, "combined.csv")

output_path = os.path.join(BASE_DIR, "features.csv")

df = pd.read_csv(combined_path)

df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

df = df.sort_values(by="Date")

df["home_avg_goals"] = (
    df["FTHG"]
    .rolling(5)
    .mean()
)

df["away_avg_goals"] = (
    df["FTAG"]
    .rolling(5)
    .mean()
)

df["goal_diff"] = (
    df["home_avg_goals"]
    - df["away_avg_goals"]
)

df["result"] = df["FTR"].map({
    "H": 0,
    "D": 1,
    "A": 2
})

df = df.dropna()

df.to_csv(output_path, index=False)

print("✅ Features created → features.csv")
print(f"Saved at: {output_path}")