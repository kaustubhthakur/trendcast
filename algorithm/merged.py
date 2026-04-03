import pandas as pd
import os

# 📂 folder where your CSV files are
DATA_FOLDER = "data"

# 📊 columns we actually need
COLUMNS = ["Date", "HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR"]

def load_and_clean(file_path, season_name):
    df = pd.read_csv(file_path)

    # keep only required columns (avoid mismatch issues)
    df = df[COLUMNS]

    # drop missing rows
    df = df.dropna()

    # add season column
    df["season"] = season_name

    return df

def main():
    files = [f for f in os.listdir(DATA_FOLDER) if f.endswith(".csv")]

    all_dfs = []

    for file in files:
        path = os.path.join(DATA_FOLDER, file)
        print(f"Processing: {file}")

        df = load_and_clean(path, file)
        all_dfs.append(df)

    # merge all data
    combined = pd.concat(all_dfs, ignore_index=True)

    # sort by date (important for ML later)
    combined["Date"] = pd.to_datetime(combined["Date"], dayfirst=True, errors="coerce")
    combined = combined.sort_values(by="Date")

    # save final dataset
    combined.to_csv("combined.csv", index=False)

    print("\n✅ Merged successfully → combined.csv")
    print(f"Total matches: {len(combined)}")

if __name__ == "__main__":
    main()