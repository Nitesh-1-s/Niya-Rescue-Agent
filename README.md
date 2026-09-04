# Niya Rescue Agent 🛡️

**Razorpay AI Buildathon 2026 Submission - Track 03: AI Revenue Recovery**

Niya is an autonomous agent designed to intercept failed payment webhooks, diagnose the root cause using LLMs, and execute a bounded recovery workflow (like a background silent retry or a WhatsApp discount intervention) to recover lost revenue.

## 🧠 Architecture & Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS (Enterprise data-dense UI)
- **Backend Core:** Python, FastAPI 
- **Database:** Supabase PostgreSQL (via IPv4 Transaction Pooler)
- **Intelligence:** OpenAI (`gpt-4o-mini`) via API

## 🚀 Key Features (The Guardrails)
Unlike basic chatbots, Niya enforces strict deterministic **stopping rules** in the Python execution layer to prevent runaway AI behavior. 

The agent operates on three bounded interventions:
1. **Silent Retry:** Triggered on temporary bank timeouts. Schedules a background retry without adding friction to the user.
2. **Send Discount SMS:** Triggered on abandoned carts or insufficient funds. Dispatches a webhook to text the user a 5% discount code to win back the sale.
3. **Escalate to Human:** Triggered on suspected fraud or complex edge cases. Safely halts AI execution and routes the ticket to ops.

## 💻 Local Development Setup

If you want to run this project locally, you will need two terminal windows.

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Activate the virtual environment
source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
pip install -r requirements.txt
```
*Note: Create a `.env` file in the backend folder with `OPENAI_API_KEY` and `DATABASE_URL`.*

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

---
*Built with caffeine and Python for the Razorpay AI Buildathon.*
