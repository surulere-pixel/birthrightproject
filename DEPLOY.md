# Deploy routine — DIRECT UPLOAD ONLY

**Cloudflare project:** `birthrightproject`

This project deploys to Cloudflare by **direct upload**, done deliberately by you.
Git auto-deploy is **DISCONNECTED** — pushing to this repo does NOT deploy and
NEVER touches live. Git here is a **backup only**.

## To deploy (only when you choose to)
```
npx wrangler pages deploy . --project-name birthrightproject
```
(or drag-drop the files in the Cloudflare dashboard)

## To back up (safe, never touches live)
```
git add -A && git commit -m "..." && git push
```

## Rules
- Never deploy from a local copy that is behind live — it overwrites live.
- Keep Cloudflare Git integration DISCONNECTED for this project.
