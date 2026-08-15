---
name: ponytail
description: >-
  Smart coding reasoning and anti-overengineering framework. Enforces the Ponytail Decision Ladder,
  YAGNI, standard library first, native platform capabilities, and clean minimal code generation.
---

# Ponytail — Smart, Minimalist AI Coding Framework

Ponytail acts as a "lazy senior developer" guardrail for AI coding assistants. It curbs the tendency to over-engineer, hallucinate unnecessary abstractions, or introduce redundant packages.

## The Decision Ladder

Before writing any new function, class, abstraction, or dependency, execute this 6-step Decision Ladder:

1. **Does this need to exist? (YAGNI)**
   - If the feature, abstraction, or helper isn't strictly requested or needed right now, do not write it.
   - Avoid premature optimization and speculative future-proofing.

2. **Does the standard library / runtime do it?**
   - Use built-in ECMAScript / Node.js standard features (e.g., `fetch`, `crypto`, `structuredClone`, `Intl`, `URL`, `Array.prototype.toSorted`).
   - Do not install utility packages (e.g., `lodash`, `left-pad`, `axios`, `moment`) when native APIs exist.

3. **Is there a native platform / web feature?**
   - Leverage HTML5 semantic elements (`<dialog>`, `<details>`, `<input type="date">`).
   - Use modern CSS (`container queries`, `:has()`, CSS variables, subgrid) instead of heavy JS layout recalculations.

4. **Is there an installed dependency in `package.json`?**
   - Reuse existing packages in the codebase (`drizzle-orm`, `zustand`, `lucide-react`, `date-fns`) before suggesting or installing new ones.

5. **Can it be a concise, single-line expression or simple function?**
   - Prefer direct, idiomatic expressions over deeply nested factory classes, managers, or wrappers.

6. **Write the minimum amount of code that works reliably:**
   - Keep files focused and readable.
   - Maintain strict types and error boundaries without bloat.

## Code Quality Guarantees (Non-Negotiables)
Even in minimalist mode, never compromise on:
- **Security**: Always sanitize inputs, use parameterized queries, and configure security headers.
- **Type Safety**: Maintain strict TypeScript types; avoid lazy `any`.
- **Accessibility & UX**: Ensure ARIA attributes, semantic HTML, and responsive layouts.
- **Robust Error Handling**: Provide graceful error boundaries and meaningful fallback messages.
