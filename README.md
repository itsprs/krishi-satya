# 🌾 Krishi Satya

**Farm Scheme Advisory Checker** — *Detect misleading WhatsApp-style forwards about Indian government agricultural schemes before they cause harm.*

> Built for **Tech-a-Thon 5.0**

---

## 📌 Problem Statement

Every day, millions of Indian farmers receive WhatsApp forwards claiming things like _"PM-Kisan doubled its payout — click this link to claim"_ or _"Your Kisan Credit Card is blocked, send OTP now."_ Many are scams.  
Farmers — often with limited digital literacy — cannot easily distinguish genuine government scheme notifications from misleading ones.

**Krishi Satya** lets anyone paste a forwarded message and get an instant verdict:

| Verdict | Meaning |
|---|---|
| ✅ **Genuine** | Message aligns with known government scheme language |
| 🚩 **Likely Hoax** | Contains patterns typical of scam/misleading forwards |
| ❓ **Uncertain** | Not enough signal to classify — needs manual review |

Along with each verdict, the tool surfaces the **keywords that drove the decision**, making the result explainable and trustworthy.

---

## 🏗️ Architecture

```
krishi-satya/
├── data/                  # Training dataset
│   └── messages.csv       # 520 labelled messages (genuine / misleading)
├── ml/                    # Machine learning pipeline
│   ├── train.py           # Training script (TF-IDF + model selection)
│   ├── model.pkl          # Serialised classifier (generated)
│   ├── vectorizer.pkl     # Serialised TF-IDF vectorizer (generated)
│   └── metrics.json       # Evaluation metrics (generated)
├── api/                   # Backend REST API
│   ├── main.py            # FastAPI application & endpoints
│   ├── inference.py       # Model loading & prediction logic
│   └── db.py              # SQLite persistence layer
├── web/                   # Frontend SPA
│   ├── src/
│   │   ├── App.tsx         # Root component
│   │   ├── components/     # UI components
│   │   │   ├── message-form.tsx
│   │   │   ├── result-card.tsx
│   │   │   ├── keyword-highlight.tsx
│   │   │   ├── history-table.tsx
│   │   │   ├── feedback-buttons.tsx
│   │   │   └── ui/         # Design-system primitives
│   │   └── lib/
│   │       ├── api.ts      # Typed API client
│   │       └── utils.ts    # Utility helpers
│   └── vite.config.ts
└── requirements.txt        # Python dependencies
```

The system follows a clean **three-layer architecture**:

```
┌─────────────────────────────────────────┐
│            React + Vite Frontend        │
│  (TypeScript, Tailwind CSS, Lucide)     │
└──────────────────┬──────────────────────┘
                   │  /api/* (Vite proxy)
                   ▼
┌─────────────────────────────────────────┐
│          FastAPI Backend (Python)        │
│    endpoints: /predict, /history,       │
│              /feedback, /health         │
└──────┬──────────────────┬───────────────┘
       │                  │
       ▼                  ▼
┌─────────────┐   ┌──────────────┐
│  ML Model   │   │   SQLite DB  │
│ (scikit‑learn)  │  (checks +   │
│ TF‑IDF + LR │   │  feedback)   │
└─────────────┘   └──────────────┘
```

---

## 🤖 Machine Learning Pipeline

### Dataset — `data/messages.csv`

- **520 samples**, balanced 50/50 across two classes:
  - `genuine` (260) — phrased like official government scheme information
  - `misleading` (260) — phrased like scam forwards (urgency cues, phishing links, OTP requests)

### Training — `ml/train.py`

The training script runs an automated model-selection pipeline:

1. **Text cleaning** — strips whitespace, deduplicates rows
2. **Feature extraction** — `TfidfVectorizer` with unigrams + bigrams, top 5 000 features, English stop-words removed
3. **Candidate models** — Logistic Regression (class-weight balanced) vs. Multinomial Naive Bayes
4. **Model selection** — 5-fold stratified cross-validation; the best model is selected automatically
5. **Evaluation** — held-out test accuracy, per-class precision/recall/F1, confusion matrix
6. **Artifacts** — saves `model.pkl`, `vectorizer.pkl`, and `metrics.json`

### Current Metrics

| Metric | Value |
|---|---|
| Model selected | Logistic Regression |
| CV accuracy (5-fold) | 100% |
| Held-out test accuracy | 100% |
| F1 (genuine) | 1.00 |
| F1 (misleading) | 1.00 |

> **Note:** The high accuracy reflects the current dataset size and clear language separation between classes. The architecture is designed for graceful degradation — when confidence drops below 60%, the system returns an "uncertain" verdict with an explanatory note instead of making a shaky call.

### Inference safeguards (`api/inference.py`)

- **Too-short messages** (< 8 chars) → `uncertain` with a "paste a fuller message" note
- **Zero TF-IDF overlap** (message has no vocabulary overlap with training data) → `uncertain`
- **Low confidence** (< 60%) → prediction is returned but flagged with a caution note
- **Top-5 keywords** extracted from TF-IDF × model-coefficient products, giving users the "why" behind each verdict

---

## 🔌 API Reference

The FastAPI backend runs on `http://localhost:8000`.

### `POST /predict`

Classify a message.

**Request:**
```json
{ "text": "PM Kisan ka paisa aa gaya hai, is link pe click karke claim karo..." }
```

**Response:**
```json
{
  "id": 42,
  "text": "PM Kisan ka paisa aa gaya hai...",
  "label": "misleading",
  "confidence": 0.9731,
  "keywords": [
    { "term": "click", "weight": 1.0 },
    { "term": "link", "weight": 1.0 },
    { "term": "claim", "weight": 1.0 }
  ],
  "note": null,
  "timestamp": "2026-08-12T13:55:00+00:00"
}
```

### `GET /history?limit=50`

Fetch past checks (most recent first).

### `POST /feedback`

Submit user feedback on a prediction.

```json
{ "id": 42, "vote": "up" }
```

### `GET /health`

Health-check endpoint — reports model-load status.

---

## 🖥️ Frontend

Built with **React 18 + TypeScript + Vite**, styled with **Tailwind CSS** using a custom parchment-inspired design system.

### Design System

The UI deliberately avoids generic web-app aesthetics. It uses a **government-ledger visual language**:

| Token | Value | Purpose |
|---|---|---|
| `paper` | `#F5EFDF` | Parchment background |
| `ink` | `#241C13` | Primary text |
| `verified` | `#2F6B3C` | Green — genuine stamp |
| `stamp` | `#A62B2B` | Red — misleading stamp |
| `uncertain` | `#6B5A2F` | Amber — uncertain state |
| `mustard` | `#C08A1E` | Accent & selection |

Typography: **Tiro Devanagari Hindi** (display), **Source Sans 3** (body), **IBM Plex Mono** (data).

### Key Components

| Component | Purpose |
|---|---|
| `MessageForm` | Textarea with character limit, validation, and loading state |
| `ResultCard` | Verdict display with rubber-stamp visual, confidence %, and keyword pills |
| `KeywordHighlight` | Colour-coded keyword pills with opacity scaled by TF-IDF weight |
| `HistoryTable` | Tabular log of all past checks with feedback indicators |
| `FeedbackButtons` | Thumbs-up / thumbs-down per prediction, persisted to DB |

### Verdict Stamp

Each result features a **circular rubber-stamp** element rendered with an SVG `feTurbulence` displacement filter, giving it a hand-pressed, slightly irregular look — inspired by government office stamps.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** with npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/krishi-satya.git
cd krishi-satya
```

### 2. Set up the Python backend

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Train the model (first-time only)

```bash
python ml/train.py
```

This generates `ml/model.pkl`, `ml/vectorizer.pkl`, and `ml/metrics.json`.

### 4. Start the API server

```bash
cd api
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Verify with `http://localhost:8000/health`.

### 5. Set up and start the frontend

```bash
cd web
npm install
npm run dev
```

The app will open at `http://localhost:5173`. The Vite dev server automatically proxies `/api/*` requests to the FastAPI backend.

---

## 🔄 How It Works — End to End

```
User pastes a WhatsApp forward
        │
        ▼
  MessageForm validates input
        │
        ▼
  POST /api/predict  ──(Vite proxy)──►  POST /predict on FastAPI
        │
        ▼
  inference.py: clean → vectorise → predict → extract keywords
        │
        ▼
  If not "uncertain": save to SQLite (db.py)
        │
        ▼
  Return { id, text, label, confidence, keywords, note, timestamp }
        │
        ▼
  ResultCard renders verdict stamp + keyword pills
        │
        ▼
  User can give thumbs-up/down feedback → POST /feedback → saved to DB
        │
        ▼
  HistoryTable refreshes with the latest check
```

---

## 📊 Dataset Details

The dataset (`data/messages.csv`) contains 520 manually authored examples:

- **Genuine messages** are modelled after official government press releases, PIB bulletins, and scheme guidelines (PM-Kisan, PMFBY, Soil Health Card, KCC, MGNREGA, eNAM, etc.)
- **Misleading messages** replicate real-world scam patterns: urgency phrases ("last 6 hours"), phishing links, OTP/Aadhaar harvesting, fake subsidy claims, and forwarded-chain language ("forwarded as received")

Both classes are balanced (260 each) with stratified train/test split (80/20).

---

## 🛡️ Privacy & Security

- **All processing happens locally** — no message text ever leaves `localhost`
- The SQLite database (`api/krishi_satya.db`) is gitignored and stays on the developer's machine
- No external API calls, no telemetry, no cloud dependencies

---

## 🗺️ Future Scope

- **Multilingual support** — extend the model to Hindi, Marathi, Tamil, and other regional languages using multilingual embeddings
- **Image/screenshot OCR** — extract text from forwarded screenshots for classification
- **WhatsApp bot integration** — let farmers forward messages directly to a WhatsApp Business number for instant verdicts
- **Active learning** — use thumbs-up/down feedback to continuously improve the model
- **Larger dataset** — partner with fact-checking organisations to scale beyond 520 samples
- **Deep learning** — explore fine-tuning IndicBERT / MuRIL for better generalisation on code-mixed (Hinglish) text

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| ML | Python, scikit-learn, pandas, joblib |
| Backend | FastAPI, Uvicorn, SQLite, Pydantic |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI primitives | class-variance-authority, Lucide icons |
| Design | Custom parchment theme, SVG filter stamps |

---

## 👥 Team

Binaries
Built for **Tech-a-Thon 5.0** 🏆

---

## 📄 License

This project is for educational and hackathon purposes.
