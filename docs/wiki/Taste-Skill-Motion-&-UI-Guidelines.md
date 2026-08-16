# Taste-Skill Motion & UI Guidelines

The **Taste-Skill Design System** guides modern frontend aesthetics, fluid animations, and theme-aware contrast.

---

## Core Visual & Motion Principles

### 1. Spring Curve Easing
All animated components (modals, dropdowns, card elevations, hover states) use fluid spring curves:
```css
--ease-spring-smooth: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring-snappy: cubic-bezier(0.19, 1, 0.22, 1);
```

### 2. Glassmorphism Panels
Panels utilize semi-transparent backdrops with blur filters and subtle highlight borders:
```css
background-color: var(--color-bg-glass);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border: 1px solid var(--color-border-subtle);
box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
```

### 3. Keycap Command Badges
Slash commands and shortcuts are rendered as keycap chips (`⌘ /command`) with monospace typography and text truncation protection.
