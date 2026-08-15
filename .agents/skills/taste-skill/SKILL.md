---
name: taste-skill
description: >-
  UI/UX design taste and fluid animation guidelines for crafting ultra-smooth,
  modern, cohesive micro-interactions, glassmorphism, spring curves, and high-aesthetic components.
---

# UI Taste & Smooth Motion Guidelines

This skill defines the visual taste standards, animation tokens, and interaction patterns for the **KobeanAI Tracker** application.

## 1. Core Visual Principles
- **Atmosphere & Glassmorphism**: Use frosted glass panels with layered depth (`backdrop-filter: blur(16px)`), subtle inner borders (`inset 0 1px 0 0 rgba(255, 255, 255, 0.08)` in dark mode), and soft dark drop shadows.
- **Harmonious Typography**: Inter for UI labels, numbers, and headings; JetBrains Mono for metrics, code snippets, tokens, and model identifiers.
- **Negative Space & Hierarchy**: Ensure breathing room (`var(--space-6)` / `var(--space-8)`), clean contrast ratios between primary and tertiary text.

## 2. Animation & Motion Tokens
Use curated spring and cubic-bezier easing curves rather than linear or generic `ease`:
```css
/* Spring & Smooth Transitions */
--ease-spring-smooth: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring-snappy: cubic-bezier(0.19, 1, 0.22, 1);
--ease-bounce-soft:   cubic-bezier(0.34, 1.56, 0.64, 1);

/* Durations */
--duration-fast:   150ms;
--duration-normal: 250ms;
--duration-smooth: 400ms;
```

## 3. Micro-Interaction Standards
- **Buttons & Interactive Elements**:
  - Hover: subtle background brightening, border accentuation, or translateY(-1px).
  - Active / Click: tactile scaling down (`transform: scale(0.98)`).
- **Cards & Data Panels**:
  - Add `.interactive-card` class for a smooth 2px lift on hover with refined shadow glow.
- **List / Feed Rows**:
  - Row hover: subtle horizontal translation (`transform: translateX(4px)`) and background tint.
- **Status Badges & Live Indicators**:
  - Include pulsing glowing dots for real-time states (e.g. Telemetry connected).

## 4. Accessibility & Performance
- Always respect `@media (prefers-reduced-motion: reduce)` to disable heavy transforms for users requesting reduced motion.
- Hardware-accelerate transforms with `will-change: transform, opacity` where appropriate.
