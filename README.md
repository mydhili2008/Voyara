# Voyara — Explore Beyond Borders

Responsive travel booking starter project: HTML/CSS/JavaScript frontend + Flask API + SQLite database.

## Features
- Three-image cinematic hero slideshow with autoplay and manual controls
- Pointer parallax, animated reveals, image zoom and responsive mobile navigation
- Flights, trains, buses and ships tabs
- Responsive design, parallax and scroll reveal animations
- Search requests sent to Flask API
- Sample results served by the backend
- Demo booking requests saved in SQLite
- Health endpoint and basic validation

## Run locally (Windows)
1. Install Python 3.11 or newer.
2. Open the project folder in VS Code and open Terminal.
3. Run:
   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python app.py
   ```
4. Visit `http://127.0.0.1:5000`. SQLite is created at `backend/instance/voyara.sqlite3`.

If PowerShell activation is blocked, use `.\.venv\Scripts\python.exe -m pip install -r requirements.txt` then `.\.venv\Scripts\python.exe app.py`.

## API
- `GET /api/health`
- `GET /api/journeys?mode=flight&origin=Vijayawada&destination=Goa&date=2026-12-01`
- `POST /api/bookings` JSON fields: `mode`, `origin`, `destination`, `departure_date`, `travellers`, `provider`
- `GET /api/bookings` — demo-only listing; not private.

## Upload to GitHub
Create a repository, then upload the **contents** of this extracted project so `backend/`, `frontend/`, `.gitignore`, and `README.md` appear at the repository root. Or run:
```bash
git init
git add .
git commit -m "Initial Voyara full-stack project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Voyara-Explore-Beyond-Borders.git
git push -u origin main
```

## Deploy Flask on Render
1. Push the project to GitHub.
2. In Render, create a **New Web Service** and connect the repository.
3. Set **Root Directory** to `backend`.
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn app:app`
6. Deploy, then visit `https://YOUR-SERVICE.onrender.com/api/health`.
7. The Flask app serves the frontend and API from the same service, so you do not need GitHub Pages for the main site.

### SQLite deployment warning
SQLite is a file on disk. If the host uses an ephemeral filesystem, bookings may disappear on restart/redeploy. For persistent production storage, use a persistent disk and set `VOYARA_DB_PATH` to a path on that disk, or migrate to managed PostgreSQL. Check current host plans and persistent storage options before relying on it.

## Important limitations
This is a demo, not a live ticket booking service. It does not connect to transport provider inventory, issue real tickets, or process payments. The sample providers and fares are illustrative. `/api/bookings` is intentionally a demo endpoint and exposes records; do not deploy it for real user data without authentication, authorization and privacy controls.

Before production: implement authentication, private booking ownership, CSRF protections where applicable, rate limiting, provider API integration, secure payment checkout, backups, privacy policy, terms, monitoring and secrets management. Never commit credentials or payment-card data.

The Flask app serves its own integrated frontend from `backend/templates/` and assets from `backend/static/`. `frontend/` is a lightweight static preview folder.
