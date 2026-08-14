#!/usr/bin/env bash
# Open the Render dashboard for Ruhi Trends.
set -euo pipefail

DASHBOARD_URL="https://dashboard.render.com/web/srv-d9vaeo7lk1mc738g0v2g"
LIVE_URL="https://ruhi-boutique.onrender.com"
PRIMARY_URL="https://ruhitrends.com"

echo ""
echo "Ruhi Trends — Render"
echo "===================="
echo ""
echo "Dashboard: ${DASHBOARD_URL}"
echo "Primary:   ${PRIMARY_URL}  (after DNS)"
echo "Fallback:  ${LIVE_URL}"
echo ""

if command -v open >/dev/null 2>&1; then
  open "${DASHBOARD_URL}"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${DASHBOARD_URL}"
fi
