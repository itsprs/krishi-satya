import joblib
import re
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "model.pkl"
VECTORIZER_PATH = Path(__file__).resolve().parent.parent / "ml" / "vectorizer.pkl"

try:
	model = joblib.load(MODEL_PATH)
	vectorizer = joblib.load(VECTORIZER_PATH)
except FileNotFoundError as e:
	raise RuntimeError(
		"Model files not found. Run `python ml/train.py` from the project root first."
	) from e

feature_names = vectorizer.get_feature_names_out()

LOW_CONFIDENCE_THRESHOLD = 0.60
MIN_MEANINGFUL_LENGTH = 8

def _clean(text: str) -> str:
	text = text.strip()
	text = re.sub(r"\s+", " ", text)
	return text

def predict(text: str, top_n: int = 5) -> dict:
	text = _clean(text)

	if len(text) < MIN_MEANINGFUL_LENGTH:
		return {
			"label": "uncertain",
			"confidence": 0.0,
			"keywords": [],
			"note": "Message is too short to classify reliably. Paste a fuller message.",
		}

	vec = vectorizer.transform([text])

	if vec.nnz == 0:
		return {
			"label": "uncertain",
			"confidence": 0.0,
			"keywords": [],
			"note": "This message doesn't resemble anything in the training data closely enough to classify confidently.",
		}

	label = model.predict(vec)[0]
	proba = model.predict_proba(vec)[0]
	confidence = float(max(proba))

	keywords = _top_keywords(vec, label, top_n)

	result = {
		"label": str(label),
		"confidence": round(confidence, 4),
		"keywords": keywords,
	}

	if confidence < LOW_CONFIDENCE_THRESHOLD:
		result["note"] = "Low-confidence prediction — treat this as a hint, not a certainty."

	return result

def _top_keywords(vec, label: str, top_n: int) -> list[str]:
	has_coef = hasattr(model, "coef_")
	nonzero_indices = vec.nonzero()[1]
	scored = []

	for idx in nonzero_indices:
		word = feature_names[idx]
		tfidf_weight = vec[0, idx]
		if has_coef:
			weight = model.coef_[0][idx]
		else:
			weight = 1.0
		contribution = tfidf_weight * weight
		scored.append((word, contribution))

	if not scored:
		return []

	reverse = label == "misleading" if has_coef else True
	scored.sort(key=lambda x: x[1], reverse=reverse)

	return [word for word, contribution in scored[:top_n] if abs(contribution) > 0]
