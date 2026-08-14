# Free deploy — Render + Neon

**Stack:** Render Free Docker web service + Neon Free Postgres  
**Brand / domain:** Ruhi Trends · **https://ruhitrends.com**

## Live service

| | |
|--|--|
| Render service | `ruhitrends` (`srv-d9vaeo7lk1mc738g0v2g`) |
| Fallback URL | https://ruhi-boutique.onrender.com |
| Custom domains | `ruhitrends.com`, `www.ruhitrends.com` (added; verify DNS) |
| `APP_URL` | `https://ruhitrends.com` |

## Custom domain (Cloudflare or any DNS)

Same pattern as muralitransport.com:

1. In Render → service **ruhitrends** → **Custom Domains**, confirm `ruhitrends.com` and `www.ruhitrends.com` are listed.
2. At your domain registrar / Cloudflare DNS:
   - **Apex** `ruhitrends.com`: CNAME Flattening / ALIAS / ANAME → `ruhi-boutique.onrender.com`  
     (or the A/CNAME targets Render shows on the domain row)
   - **www**: CNAME → `ruhi-boutique.onrender.com`
3. Keep DNS **DNS-only** (grey cloud) until Render shows the domain as verified, then you can proxy.
4. `APP_URL` is already set to `https://ruhitrends.com`.

If the domain is not registered yet, buy **ruhitrends.com** first (Cloudflare Registrar works well with this stack).

## Local

```bash
npm install && npm run dev

cd apps/api && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
ALLOW_INSECURE_DEFAULT_PIN=1 uvicorn app.main:app --reload --port 8001
```
