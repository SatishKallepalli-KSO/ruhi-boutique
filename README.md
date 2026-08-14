# Ruhi Trends

Website for **Ruhi Trends** (`ruhitrends.com`) — the online home of **Ruhi's Boutique** in Kukatpally (KPHB 7th Phase), Hyderabad.

**Primary:** https://ruhitrends.com *(after DNS)*  
**Fallback:** https://ruhi-boutique.onrender.com  
**Stack:** Render Free + Neon Free · same pattern as Murali Transport

## Business

| | |
|--|--|
| Brand | Ruhi Trends |
| Store | Ruhi's Boutique |
| Address | Plot No. LIG-140, Opposite Basketball Ground, KPHB 7th Phase, Kukatpally, Hyderabad 500072 |
| Phone | +91 99081 85597 |
| Justdial | [Listing](https://www.justdial.com/Hyderabad/Ruhis-Botique-Opposite-Basket-Ball-Ground-Kukatpally/040PXX40-XX40-240824180839-T6T3_BZDET) |

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, API, data model |
| [docs/DEPLOY-FREE.md](docs/DEPLOY-FREE.md) | Deploy on Render + Neon + custom domain |
| [docs/DATABASE.md](docs/DATABASE.md) | Neon connection |
| [docs/SECURITY.md](docs/SECURITY.md) | PIN, PII redaction, rate limits |

## Quick start

```bash
npm install && npm run dev   # http://localhost:5176

cd apps/api && python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
ALLOW_INSECURE_DEFAULT_PIN=1 uvicorn app.main:app --reload --port 8001
```

Admin desk PIN: set `ADMIN_PIN` (8+ characters). Local-only: `ALLOW_INSECURE_DEFAULT_PIN=1`.
