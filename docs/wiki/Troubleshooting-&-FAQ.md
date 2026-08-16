# Troubleshooting & Frequently Asked Questions

---

## 1. Frequently Asked Questions

### Q: Why are my sessions not appearing on the Dashboard?
1. Click **"Sync Logs"** on the Sessions page or **"Sync"** in the top header.
2. Verify that your AI assistant is writing transcripts to local default paths:
   - **Google Antigravity**: `~/.gemini/antigravity-ide/brain/`
   - **Claude Code**: `~/.claude/transcripts/`
   - **Cursor**: `~/.cursor/logs/`

### Q: How do I change the backend port?
By default, the backend API runs on port `3000` and the frontend on port `5173`. You can customize this by setting `PORT=3001` in your `.env` file.

### Q: How do I backup or reset my SQLite telemetry database?
The SQLite database is stored locally at `./sqlite.db`. To reset all telemetry, simply delete `sqlite.db` (and associated `-wal` / `-shm` files) and restart the server; it will automatically recreate fresh tables with WAL mode enabled.

---

## 2. Diagnostics Commands

```bash
# Check backend server health
curl http://localhost:3000/api/health

# Trigger manual telemetry scan
curl -X POST http://localhost:3000/api/sessions/sync

# Run frontend & backend build check
npm run build
```
