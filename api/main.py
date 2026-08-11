from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import inference
import db

app = FastAPI(title="Krishi Satya API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)

db.init_db()

class PredictRequest(BaseModel):
	text: str

class FeedbackRequest(BaseModel):
	check_id: int
	feedback: str

@app.post("/predict")
def predict(req: PredictRequest):
	if not req.text or not req.text.strip():
		raise HTTPException(status_code=400, detail="text cannot be empty")

	result = inference.predict(req.text)
	check_id = db.insert_check(req.text, result["label"], result["confidence"], result["keywords"])

	return {"id": check_id, **result}

@app.get("/history")
def history(limit: int = 50):
	return db.get_history(limit)

@app.post("/feedback")
def feedback(req: FeedbackRequest):
	if req.feedback not in ("up", "down"):
		raise HTTPException(status_code=400, detail="feedback must be 'up' or 'down'")
	db.set_feedback(req.check_id, req.feedback)
	return {"ok": True}

@app.get("/")
def root():
	return {"status": "Krishi Satya API running"}
