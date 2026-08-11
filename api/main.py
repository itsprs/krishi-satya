import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import inference
import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("krishi_satya")

app = FastAPI(title="Krishi Satya API", version="1.0.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)

db.init_db()

MAX_TEXT_LENGTH = 2000

class PredictRequest(BaseModel):
	text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)

class PredictResponse(BaseModel):
	id: int | None = None
	label: str
	confidence: float
	keywords: list[str]
	note: str | None = None

class FeedbackRequest(BaseModel):
	check_id: int
	feedback: str = Field(..., pattern="^(up|down)$")

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
	text = req.text.strip()
	if not text:
		raise HTTPException(status_code=422, detail="text cannot be empty or whitespace-only")

	try:
		result = inference.predict(text)
	except Exception:
		logger.exception("Prediction failed")
		raise HTTPException(status_code=500, detail="Prediction failed — check server logs")

	check_id = None
	if result["label"] != "uncertain":
		try:
			check_id = db.insert_check(text, result["label"], result["confidence"], result["keywords"])
		except Exception:
			logger.exception("Failed to save check to history")

	return {"id": check_id, **result}

@app.get("/history")
def history(limit: int = 50):
	limit = max(1, min(limit, 200))
	try:
		return db.get_history(limit)
	except Exception:
		logger.exception("Failed to fetch history")
		raise HTTPException(status_code=500, detail="Could not fetch history")

@app.post("/feedback")
def feedback(req: FeedbackRequest):
	try:
		db.set_feedback(req.check_id, req.feedback)
	except Exception:
		logger.exception("Failed to save feedback")
		raise HTTPException(status_code=500, detail="Could not save feedback")
	return {"ok": True}

@app.get("/health")
def health():
	model_ready = hasattr(inference, "model") and inference.model is not None
	return {"status": "ok" if model_ready else "model not loaded", "model_ready": model_ready}

@app.get("/")
def root():
	return {"status": "Krishi Satya API running"}
