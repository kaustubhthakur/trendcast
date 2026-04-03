import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# load data
df = pd.read_csv("features.csv")

# features and target
X = df[["home_avg_goals", "away_avg_goals", "goal_diff"]]
y = df["result"]

# split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# model (fixed convergence issue)
model = LogisticRegression(max_iter=1000)

# train
model.fit(X_train, y_train)

# accuracy
accuracy = model.score(X_test, y_test)
print("Accuracy:", accuracy)


# 🔥 FIXED PREDICTION (no warning now)
sample = pd.DataFrame(
    [[1.8, 1.2, 0.6]],
    columns=["home_avg_goals", "away_avg_goals", "goal_diff"]
)

probs = model.predict_proba(sample)

print("\nPrediction (Home, Draw, Away):", probs)


# 🔥 BONUS: test on real data
print("\n--- Real Match Predictions ---")
for i in range(3):
    sample_real = X_test.iloc[i:i+1]
    probs_real = model.predict_proba(sample_real)

    print(f"\nMatch {i+1}")
    print("Features:", sample_real.values)
    print("Prediction:", probs_real)
    print("Actual:", y_test.iloc[i])
    