# Ruhi's Boutique

Website for **Ruhi's Boutique** in Kukatpally (KPHB 7th Phase), Hyderabad — custom stitching, bridal wear, and boutique visit bookings.

**Live (after deploy):** https://ruhi-boutique.onrender.com  
**Stack:** Render Free + Neon Free · same pattern as [Murali Transport](https://muralitransport.com)

## Business

| | |
|--|--|
| Address | Plot No. LIG-140, Opposite Basketball Ground, KPHB 7th Phase, Kukatpally, Hyderabad 500072 |
| Phone | +91 99081 85597 |
| Justdial | [Listing](https://www.justdial.com/Hyderabad/Ruhis-Botique-Opposite-Basket-Ball-Ground-Kukatpally/040PXX40-XX40-240824180839-T6T3_BZDET) |

> Confirm phone / hours with the boutique owner before publishing marketing materials. Public listing data can change.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, API, data model |
| [docs/DEPLOY-FREE.md](docs/DEPLOY-FREE.md) | Deploy on Render + Neon |
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

## API highlights

| Method | Path | Who |
|--------|------|-----|
| POST | `/v1/appointments` | Book a boutique visit |
| POST | `/v1/stitch-orders` | Request custom stitching |
| POST | `/v1/admin/login` | Admin PIN → token |
| GET | `/v1/appointments` | List (redacted public / full admin) |
| GET | `/v1/stitch-orders` | List (redacted public / full admin) |
| PATCH | `/v1/appointments/{id}` | Admin update status |
| PATCH | `/v1/stitch-orders/{id}` | Admin update status |

## Tests & CI

```bash
npm run lint && npm run build
cd apps/api && pip install -r requirements.txt && pytest -q
```
