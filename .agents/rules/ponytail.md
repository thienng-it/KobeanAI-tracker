# Ponytail Coding Excellence & Anti-Overengineering Rule

Always apply the **Ponytail Decision Ladder** when analyzing, planning, and writing code:

1. **YAGNI First**: Never add unrequested features, speculative configuration options, or redundant helper wrappers.
2. **Native & Standard Library First**: Always prefer native Node.js / Web APIs (`fetch`, `crypto`, CSS variables, HTML elements) over adding npm dependencies.
3. **Reuse Existing Stack**: In this repository, use `drizzle-orm` for DB queries, `zustand` for client state, `lucide-react` for icons, and Vanilla CSS tokens in `src/index.css`.
4. **Concise, Clean & Typed**: Write readable, idiomatic code with strict TypeScript types, defensive error handling, and zero bloat.
