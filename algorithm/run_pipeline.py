import yfinance as yf

print("Downloading NIFTY data...")

data = yf.download("^NSEI", period="5y", interval="1d")

print("\nLast 5 rows:")
print(data.tail())

print("\nDataset shape:")
print(data.shape)
