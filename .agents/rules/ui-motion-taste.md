# UI Motion & Design Taste Rule

- **Design System Consistency**: Always reuse tokens defined in `src/index.css` (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--ease-spring-*)`).
- **Interactive Feedback**: All clickable elements must have active states (`:active { transform: scale(0.98); }`) and smooth hover transitions.
- **Glassmorphism**: Always use `.glass-panel` for cards and content containers.
- **Chart & Data Polishing**: Charts and data cards should animate in on page mount using smooth fade-up transitions (`animation: slideUp 0.35s var(--ease-spring-smooth)`).
