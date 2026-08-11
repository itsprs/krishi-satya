import pandas as pd
import joblib
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "messages.csv"
MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"
VECTORIZER_PATH = Path(__file__).resolve().parent / "vectorizer.pkl"

def main():
	df = pd.read_csv(DATA_PATH)
	df["label"] = df["label"].str.strip().str.lower()
	df["text"] = df["text"].str.strip()

	print(f"Loaded {len(df)} rows")
	print(df["label"].value_counts().to_string())

	X_train, X_test, y_train, y_test = train_test_split(
		df["text"], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
	)

	vectorizer = TfidfVectorizer(stop_words="english", max_features=3000)
	X_train_vec = vectorizer.fit_transform(X_train)
	X_test_vec = vectorizer.transform(X_test)

	model = LogisticRegression(max_iter=1000)
	model.fit(X_train_vec, y_train)

	y_pred = model.predict(X_test_vec)
	acc = accuracy_score(y_test, y_pred)

	print(f"\naccuracy: {acc:.2%}\n")
	print(classification_report(y_test, y_pred))

	joblib.dump(model, MODEL_PATH)
	joblib.dump(vectorizer, VECTORIZER_PATH)

if __name__ == "__main__":
	main()
