# Secret Leak Prevention (`.betterleak`)

`.betterleak` is an active credential and API key detection protocol built into KobeanAI Tracker.

---

## 1. Monitored Credential Patterns

| Secret Type | Regex Match Pattern |
| :--- | :--- |
| **Google Gemini API Key** | `AIzaSy[0-9A-Za-z_-]{33}` |
| **Anthropic Claude API Key** | `sk-ant-[a-zA-Z0-9_-]{20,}` |
| **OpenAI API Key** | `sk-[a-zA-Z0-9]{32,}` |
| **GitHub Personal Access Token** | `ghp_[a-zA-Z0-9]{36}` |
| **AWS Access Key ID** | `AKIA[0-9A-Z]{16}` |

---

## 2. Automated Git Hook Setup

To protect your repository locally before staging commits:

```bash
cat << 'EOF' > .git/hooks/pre-commit
#!/bin/sh
echo "🔍 Running .betterleak secret scan..."
git diff --cached | grep -E "(AIzaSy[0-9A-Za-z_-]{33}|sk-ant-[a-zA-Z0-9_-]{20,}|sk-[a-zA-Z0-9]{32,})"
if [ $? -eq 0 ]; then
  echo "❌ Sensitive API token detected in staged files! Aborting commit."
  exit 1
fi
echo "✅ No sensitive secrets detected."
EOF
chmod +x .git/hooks/pre-commit
```
