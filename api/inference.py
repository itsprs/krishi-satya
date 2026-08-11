import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "model.pkl"
VECTORIZER_PATH = Path(__file__).resolve().parent.parent / "ml" / "vectorizer.pkl"

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

feature_names = vectorizer.get_feature_names_out()

def predict(text: str, top_n: int = 5):
	vec = vectorizer.transform([text])
	label = model.predict(vec)[0]
	proba = model.predict_proba(vec)[0]
	confidence = float(max(proba))

	classes = list(model.classes_)
	misleading_idx = classes.index("misleading") if "misleading" in classes else 1
	coefs = model.coef_[0]

	nonzero_indices = vec.nonzero()[1]
	scored = []
	for idx in nonzero_indices:
		word = feature_names[idx]
		tfidf_weight = vec[0, idx]
		contribution = tfidf_weight * coefs[idx]
		scored.append((word, contribution))

	if label == "misleading":
		scored.sort(key=lambda x: x[1], reverse=True)
	else:
		scored.sort(key=lambda x: x[1])

	top_keywords = [word for word, _ in scored[:top_n] if abs(_) > 0]

	return {
		"label": str(label),
		"confidence": round(confidence, 4),
		"keywords": top_keywords,
	}
