# Database — Neon Free

| | |
|--|--|
| Neon project | `ruhi-boutique` (`patient-recipe-30909255`) |
| Region | `aws-us-west-2` |
| Database / role | `ruhi` |
| Org | `org-falling-bird-44330402` |
| Plan | Free |
| App `DATABASE_URL` | Neon **pooled** connection (set on Render) |

```bash
neonctl connection-string \
  --project-id patient-recipe-30909255 \
  --org-id org-falling-bird-44330402 \
  --database-name ruhi \
  --role-name ruhi \
  --pooled
```

## Backups

```bash
NEON_PROJECT_ID=patient-recipe-30909255 ./scripts/backup-db.sh --neon
```
