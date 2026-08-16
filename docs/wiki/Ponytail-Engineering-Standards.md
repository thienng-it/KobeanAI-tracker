# Ponytail Engineering Standards & Anti-Overengineering Framework

The **Ponytail Framework** establishes a strict mental model to prevent AI agents from over-engineering solutions, adding unnecessary dependencies, or introducing dead code.

---

## The 6-Step Decision Ladder

1. **Ladder Step 1 (YAGNI & Simplicity)**: Never build for hypothetical future requirements. Implement the leanest working solution.
2. **Ladder Step 2 (Standard Library First)**: Always prefer runtime built-in modules (`fetch`, `crypto`, `URLSearchParams`, `AbortController`) over third-party npm packages.
3. **Ladder Step 3 (Native Platform Capabilities)**: Use native CSS variables, flex/grid layouts, and standard Web APIs before installing component libraries.
4. **Ladder Step 4 (Direct Implementations)**: Prefer a direct 10-line helper function over a 50kb external package.
5. **Ladder Step 5 (Clean Architecture & Contracts)**: Preserve strict separation between API routes, state stores, and UI views.
6. **Ladder Step 6 (Zero Dead Code & Deprecations)**: Remove unused imports, variables, and legacy dependencies during refactoring.
