# Free deploy — Render + Neon

Same free-tier pattern as Murali Transport: **Render Free Docker** + **Neon Free Postgres**.

## One-click

1. Push this repo to GitHub.
2. Open: https://render.com/deploy?repo=https://github.com/SatishKallepalli-KSO/ruhi-boutique
3. Set `ADMIN_PIN` (8+ strong characters) and `DATABASE_URL` (Neon pooled URL).
4. Redeploy. Health: `https://ruhi-boutique.onrender.com/healthz`

## Neon database

Create a Neon project (or a new database in the existing org), then:

```bash
neonctl connection-string \
  --project-id <PROJECT_ID> \
  --org-id org-falling-bird-44330402 \
  --database-name ruhi \
  --role-name ruhi \
  --pooled
```

Paste the pooled URL into Render → Environment → `DATABASE_URL`.

## Local

```bash
npm install && npm run dev

cd apps/api && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
ALLOW_INSECURE_DEFAULT_PIN=1 uvicorn app.main:app --reload --port 8001
```
