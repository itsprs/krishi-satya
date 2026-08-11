import sqlite3
from pathlib import Path
from datetime import datetime, timezone

DB_PATH = Path(__file__).resolve().parent / "krishi_satya.db"

def get_connection():
	conn = sqlite3.connect(DB_PATH)
	conn.row_factory = sqlite3.Row
	return conn

def init_db():
	conn = get_connection()
	conn.execute(
		"""
		CREATE TABLE IF NOT EXISTS checks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			text TEXT NOT NULL,
			label TEXT NOT NULL,
			confidence REAL NOT NULL,
			keywords TEXT,
			feedback TEXT,
			created_at TEXT NOT NULL
		)
		"""
	)
	conn.commit()
	conn.close()

def insert_check(text: str, label: str, confidence: float, keywords: list[str]) -> int:
	conn = get_connection()
	cursor = conn.execute(
		"""
		INSERT INTO checks (text, label, confidence, keywords, feedback, created_at)
		VALUES (?, ?, ?, ?, NULL, ?)
		""",
		(text, label, confidence, ",".join(keywords), datetime.now(timezone.utc).isoformat()),
	)
	conn.commit()
	new_id = cursor.lastrowid
	conn.close()
	return new_id

def get_history(limit: int = 50):
	conn = get_connection()
	rows = conn.execute(
		"SELECT * FROM checks ORDER BY id DESC LIMIT ?", (limit,)
	).fetchall()
	conn.close()
	return [dict(row) for row in rows]

def set_feedback(check_id: int, feedback: str):
	conn = get_connection()
	conn.execute(
		"UPDATE checks SET feedback = ? WHERE id = ?", (feedback, check_id)
	)
	conn.commit()
	conn.close()