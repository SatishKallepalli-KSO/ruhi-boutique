# Security notes

## Admin PIN

- Set a strong `ADMIN_PIN` (8+ characters) on Render and locally.
- Production (Render) **rejects** missing PINs and known weak defaults.
- Local-only escape hatch: `ALLOW_INSECURE_DEFAULT_PIN=1` (never on Render).

## Public vs admin data

| Surface | Phones / names / notes |
|---------|------------------------|
| Public `GET /v1/appointments`, `/v1/stitch-orders` | Redacted |
| Admin Bearer on same routes | Full records |
| `PATCH` / `DELETE` | Admin only |

## Rate limits

- Admin login: 5 failures / IP / 15 minutes
- Public writes (`POST` appointments, stitch-orders), per IP and action:
  - **1 / minute**
  - **3 / 5 minutes**
  - **8 / hour**
- Analytics hit beacon: **60 / minute / IP**

## Sessions

- Admin Bearer tokens are in-memory (single Render instance).
- Browser stores token in `sessionStorage` key `ruhi_admin_token`.
