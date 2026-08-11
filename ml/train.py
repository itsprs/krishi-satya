import pandas as pd
import joblib
import json
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "messages.csv"
MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"
VECTORIZER_PATH = Path(__file__).resolve().parent / "vectorizer.pkl"
METRICS_PATH = Path(__file__).resolve().parent / "metrics.json"

def main():
	df = pd.read_csv(DATA_PATH)
	df["label"] = df["label"].str.strip().str.lower()
	df["text"] = df["text"].str.strip()
	df = df[df["text"].str.len() > 0].reset_index(drop=True)
	df = df.drop_duplicates(subset="text").reset_index(drop=True)

	print(f"Loaded {len(df)} rows (after cleaning/deduping)")
	print(df["label"].value_counts().to_string())

	X_train, X_test, y_train, y_test = train_test_split(
		df["text"], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
	)

	vectorizer = TfidfVectorizer(
		stop_words="english",
		max_features=5000,
		ngram_range=(1, 2),
		min_df=1,
	)
	X_train_vec = vectorizer.fit_transform(X_train)
	X_test_vec = vectorizer.transform(X_test)

	candidates = {
		"logistic_regression": LogisticRegression(max_iter=1000, class_weight="balanced"),
		"naive_bayes": MultinomialNB(),
	}

	best_name, best_model, best_cv_score = None, None, -1
	print("\n--- Cross-validation (5-fold) on training set ---")
	for name, candidate in candidates.items():
		scores = cross_val_score(candidate, X_train_vec, y_train, cv=5)
		mean_score = scores.mean()
		print(f"{name}: {mean_score:.2%} (+/- {scores.std():.2%})")
		if mean_score > best_cv_score:
			best_name, best_model, best_cv_score = name, candidate, mean_score

	print(f"\nSelected model: {best_name}")
	best_model.fit(X_train_vec, y_train)

	y_pred = best_model.predict(X_test_vec)
	acc = accuracy_score(y_test, y_pred)
	report = classification_report(y_test, y_pred, output_dict=True)
	cm = confusion_matrix(y_test, y_pred, labels=best_model.classes_)

	print(f"\nHeld-out test accuracy: {acc:.2%}\n")
	print(classification_report(y_test, y_pred))
	print("Confusion matrix (rows=actual, cols=predicted):")
	print(f"  labels: {list(best_model.classes_)}")
	print(cm)

	joblib.dump(best_model, MODEL_PATH)
	joblib.dump(vectorizer, VECTORIZER_PATH)

	metrics = {
		"model": best_name,
		"cv_accuracy": round(best_cv_score, 4),
		"test_accuracy": round(acc, 4),
		"classification_report": report,
		"n_rows": len(df),
		"class_balance": df["label"].value_counts().to_dict(),
	}
	with open(METRICS_PATH, "w") as f:
		json.dump(metrics, f, indent=2)

	print(f"\nSaved model to {MODEL_PATH}")
	print(f"Saved vectorizer to {VECTORIZER_PATH}")
	print(f"Saved metrics to {METRICS_PATH}")

if __name__ == "__main__":
	main()
