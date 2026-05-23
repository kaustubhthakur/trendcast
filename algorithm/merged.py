import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FOLDER = os.path.join(BASE_DIR, "data")

COLUMNS = [
    "Date",
    "HomeTeam",
    "AwayTeam",
    "FTHG",
    "FTAG",
    "FTR"
]


def load_and_clean(file_path, season_name):

    try:

        df = pd.read_csv(file_path, encoding="latin1")

        missing_cols = [
            col for col in COLUMNS
            if col not in df.columns
        ]

        if missing_cols:
            print(f"Skipping {season_name}")
            print(f"Missing columns: {missing_cols}")
            return None

        df = df[COLUMNS].copy()

        df = df.dropna()

        df["season"] = season_name

        return df

    except Exception as e:

        print(f"Error processing {season_name}: {e}")
        return None


def main():

    print(f"\nUsing data folder: {DATA_FOLDER}\n")

    if not os.path.exists(DATA_FOLDER):

        print("❌ Data folder not found")
        return

    files = [
        f for f in os.listdir(DATA_FOLDER)
        if f.endswith(".csv")
    ]

    if not files:

        print("❌ No CSV files found")
        return

    all_dfs = []

    for file in files:

        path = os.path.join(DATA_FOLDER, file)

        print(f"Processing: {file}")

        df = load_and_clean(path, file)

        if df is not None:
            all_dfs.append(df)

    if not all_dfs:

        print("❌ No valid data found")
        return

    combined = pd.concat(all_dfs, ignore_index=True)

    combined["Date"] = pd.to_datetime(
        combined["Date"],
        dayfirst=True,
        errors="coerce"
    )

    combined = combined.dropna(subset=["Date"])

    combined = combined.sort_values(by="Date")

    output_path = os.path.join(BASE_DIR, "combined.csv")

    combined.to_csv(output_path, index=False)

    print("\n✅ Merged successfully")
    print(f"Saved to: {output_path}")
    print(f"Total matches: {len(combined)}")


if __name__ == "__main__":
    main()