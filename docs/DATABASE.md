# Database — Neon Free

| | |
|--|--|
| Suggested DB / role | `ruhi` |
| Org (same as Murali) | `org-falling-bird-44330402` |
| Plan | Free |
| App `DATABASE_URL` | Neon **pooled** connection (set on Render) |

```bash
neonctl connection-string \
  --project-id <PROJECT_ID> \
  --org-id org-falling-bird-44330402 \
  --database-name ruhi \
  --role-name ruhi \
  --pooled
```

## Backups

```bash
./scripts/backup-db.sh --url
# or configure NEON_PROJECT_ID and use --neon
```
