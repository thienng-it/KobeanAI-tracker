---
title: "KobeanAI Tracker — UI/UX Design System Specification"
type: spec
status: draft
author: "Chief Design Officer"
created: 2026-08-11
updated: 2026-08-11
tags: [kobeanai, design-system, css, ui, ux, components]
---

# KobeanAI Tracker — UI/UX Design System Specification

> **Version:** 1.0.0  
> **Status:** Draft — Pending Review  
> **Target Audience:** Frontend Engineers, Designers

This document defines the comprehensive UI/UX design system for KobeanAI Tracker. It is built to feel premium, modern, and perfectly suited for developer workflows, drawing inspiration from top-tier dev tools like Linear, Raycast, and Arc Browser. The system is **dark-mode-first**.

---

## 1. Design Principles

Our design philosophy revolves around making developers feel powerful, focused, and in control.

1. **Clarity over cleverness**
   - **Example:** Use explicit labels for actions instead of ambiguous icons. A button should say "New Session" rather than just showing a `+` icon when space permits. 
   - **Rationale:** Developers are moving fast; they shouldn't have to guess what a control does.

2. **Progressive disclosure**
   - **Example:** In the Skill Manager, show only the skill name, description, and tags in the list view. Complex settings (like agent compatibility and parameters) are only revealed when editing or expanding the skill.
   - **Rationale:** Keep the default UI uncluttered to reduce cognitive load.

3. **Consistent patterns**
   - **Example:** All modal dialogs use the exact same glassmorphism backdrop (`backdrop-blur-sm bg-black/40`), the same enter animation (`slideUp`), and the same footer layout (cancel on left, primary action on right).
   - **Rationale:** Predictability breeds speed. If a user learns a pattern once, it applies everywhere.

4. **Keyboard-first**
   - **Example:** Every actionable element has a clear `:focus-visible` state. The Command Palette (`Cmd/Ctrl+K`) allows navigation to any page and execution of quick actions without touching the mouse.
   - **Rationale:** Power users rely heavily on keyboard shortcuts to maintain flow.

5. **Dark mode default**
   - **Example:** The foundational color palette is optimized for emissive displays (dark grays/blacks). Light mode is implemented via override variables, rather than being the base.
   - **Rationale:** Developers overwhelmingly prefer dark themes to reduce eye strain during long coding sessions.

---

## 2. Color System

The color system relies on CSS custom properties. All colors must pass WCAG 2.1 AA contrast ratios (minimum 4.5:1 for normal text against its background).

### 2.1 Dark Theme (Primary Base)
```css
:root {
  /* Core Neutrals - Dark Theme */
  --gray-50:  #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --gray-950: #030712;
  
  --black: #000000;
  --white: #ffffff;
}
```

### 2.2 Semantic Color Tokens
```css
:root {
  /* Backgrounds */
  --color-bg-app: var(--gray-950);
  --color-bg-surface: var(--gray-900);
  --color-bg-surface-hover: var(--gray-800);
  --color-bg-surface-active: var(--gray-700);

  /* Text */
  --color-text-primary: var(--gray-50);
  --color-text-secondary: var(--gray-400);
  --color-text-tertiary: var(--gray-500);
  --color-text-inverse: var(--gray-950);

  /* Borders */
  --color-border-subtle: var(--gray-800);
  --color-border-default: var(--gray-700);
  --color-border-strong: var(--gray-500);

  /* Interactive / Brand */
  --color-brand-primary: #3b82f6; /* Blue 500 */
  --color-brand-hover: #2563eb;   /* Blue 600 */
  --color-brand-active: #1d4ed8;  /* Blue 700 */
}
```

### 2.3 Status Colors
```css
:root {
  --color-status-success: #10b981; /* Emerald 500 */
  --color-status-success-bg: rgba(16, 185, 129, 0.1);
  --color-status-success-text: #34d399; /* Emerald 400 */

  --color-status-warning: #f59e0b; /* Amber 500 */
  --color-status-warning-bg: rgba(245, 158, 11, 0.1);
  --color-status-warning-text: #fbbf24; /* Amber 400 */

  --color-status-error: #ef4444; /* Red 500 */
  --color-status-error-bg: rgba(239, 68, 68, 0.1);
  --color-status-error-text: #f87171; /* Red 400 */

  --color-status-info: #3b82f6; /* Blue 500 */
  --color-status-info-bg: rgba(59, 130, 246, 0.1);
  --color-status-info-text: #60a5fa; /* Blue 400 */
}
```

### 2.4 Agent Brand Colors
```css
:root {
  --color-agent-claude: #d97757;      /* Anthropic Orange */
  --color-agent-codex: #10a37f;       /* OpenAI Green */
  --color-agent-antigravity: #4285f4; /* Google Blue */
  --color-agent-cursor: #9333ea;      /* Purple */
  --color-agent-copilot: #6e7681;     /* GitHub Gray */
}
```

### 2.5 Tag Prefix Colors
Harmonious palette ensuring unique visual identity for each workflow phase.
```css
:root {
  --color-tag-us: #3b82f6;    /* Blue (User Story) */
  --color-tag-de: #ef4444;    /* Red (Defect) */
  --color-tag-fe: #10b981;    /* Emerald (Feature) */
  --color-tag-sp: #8b5cf6;    /* Violet (Sprint) */
  --color-tag-ep: #d946ef;    /* Fuchsia (Epic) */
  --color-tag-ch: #6b7280;    /* Gray (Chore) */
  --color-tag-arch: #f59e0b;  /* Amber (Architecture) */
  --color-tag-doc: #06b6d4;   /* Cyan (Documentation) */
  --color-tag-exp: #ec4899;   /* Pink (Experiment) */
  --color-tag-learn: #14b8a6; /* Teal (Learning) */
}
```

### 2.6 Light Theme Override
```css
[data-theme="light"] {
  --color-bg-app: var(--gray-50);
  --color-bg-surface: var(--white);
  --color-bg-surface-hover: var(--gray-100);
  --color-bg-surface-active: var(--gray-200);

  --color-text-primary: var(--gray-900);
  --color-text-secondary: var(--gray-600);
  --color-text-tertiary: var(--gray-500);
  --color-text-inverse: var(--white);

  --color-border-subtle: var(--gray-200);
  --color-border-default: var(--gray-300);
  --color-border-strong: var(--gray-400);
}
```

---

## 3. Typography System

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Font Stacks:**
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

**Type Scale:**
| Level | Font Size | Line Height | Font Weight (Default) | Letter Spacing | CSS Variable |
|---|---|---|---|---|---|
| `text-xs` | 12px (0.75rem) | 16px (1rem) | 400 (Regular) | 0.02em | `--text-xs` |
| `text-sm` | 14px (0.875rem) | 20px (1.25rem) | 400 (Regular) | 0em | `--text-sm` |
| `text-base` | 16px (1rem) | 24px (1.5rem) | 400 (Regular) | 0em | `--text-base` |
| `text-lg` | 18px (1.125rem) | 28px (1.75rem) | 500 (Medium) | -0.01em | `--text-lg` |
| `text-xl` | 20px (1.25rem) | 28px (1.75rem) | 600 (Semi-bold) | -0.01em | `--text-xl` |
| `text-2xl` | 24px (1.5rem) | 32px (2rem) | 600 (Semi-bold) | -0.02em | `--text-2xl` |
| `text-3xl` | 30px (1.875rem) | 36px (2.25rem) | 700 (Bold) | -0.02em | `--text-3xl` |

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px Base Grid)
```css
:root {
  --space-1: 4px;   /* 0.25rem */
  --space-2: 8px;   /* 0.5rem */
  --space-3: 12px;  /* 0.75rem */
  --space-4: 16px;  /* 1rem */
  --space-5: 20px;  /* 1.25rem */
  --space-6: 24px;  /* 1.5rem */
  --space-8: 32px;  /* 2rem */
  --space-10: 40px; /* 2.5rem */
  --space-12: 48px; /* 3rem */
  --space-16: 64px; /* 4rem */
}
```

### 4.2 Layout Dimensions
```css
:root {
  --layout-sidebar-width: 240px;
  --layout-sidebar-collapsed-width: 64px;
  --layout-header-height: 56px;
  --layout-content-max-width: 1280px;
  --layout-gutter: var(--space-6);
}
```

### 4.3 Common Layout Patterns
- **Flex Center (Centering content vertically and horizontally):** `display: flex; align-items: center; justify-content: center;`
- **Flex Between (Spreading content):** `display: flex; align-items: center; justify-content: space-between;`
- **Grid Layout (Dashboard Cards):** `display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4);`

---

## 5. Effects & Surfaces

### 5.1 Border Radius
```css
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}
```

### 5.2 Box Shadows
Shadows in dark mode are subtler and often rely on borders and inner highlights rather than heavy drop shadows to create depth.
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 12px 0 rgba(59, 130, 246, 0.3); /* Brand primary glow */
  
  /* Focus Ring */
  --focus-ring: 0 0 0 2px var(--color-bg-app), 0 0 0 4px var(--color-brand-primary);
}
```

### 5.3 Glassmorphism Surfaces
For overlays, popovers, and floating headers.
```css
.glass-panel {
  background-color: rgba(17, 24, 39, 0.7); /* gray-900 with opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border-subtle);
}
```

---

## 6. Animation System

### 6.1 Transition Timing Functions
```css
:root {
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
}
```

### 6.2 Keyframe Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 6.3 Micro-interactions
- **Button Hover:** Transform scale to `1.02` for primary buttons, adjust background brightness. Transition `background-color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-spring)`.
- **Card Hover:** Subtle border color change (e.g., subtle to default) and translate Y by `-2px`.
- **Modal Enter/Exit:** Enter with `scaleIn` (150ms), exit with reverse (fade out + scale down).
- **Toast Enter:** `slideIn` from the bottom-right corner.
- **Tag Appear:** Tags in lists load with a staggered `fadeIn` and `slideUp`.

---

## 7. Component Inventory

### 7.1 Primitives
- **Button:**
  - *Purpose:* Trigger actions.
  - *States:* Default, hover, active, disabled, loading.
  - *Variants:* Primary (solid blue), Secondary (surface bg), Ghost (transparent). Sizes: sm, md, lg.
  - *Classes:* `.btn`, `.btn-primary`, `.btn-sm`.
  - *Accessibility:* Must have `role="button"`, focus ring visible on keyboard navigation.
- **IconButton:**
  - *Purpose:* Actions represented solely by an icon (e.g., trash, edit).
  - *States:* Default (dimmed icon), hover (bright icon + subtle bg), focus-visible.
- **Input / Textarea:**
  - *Purpose:* Text data entry.
  - *States:* Default, focused (blue border + shadow-glow), disabled (opacity 0.5), error (red border).
  - *Classes:* `.input`, `.textarea`.
  - *Accessibility:* Requires associated `<label>`, `aria-invalid` when error.
- **Select:**
  - *Purpose:* Choose from a list of options. Custom UI to allow search if options > 10.
- **Checkbox / Toggle:**
  - *Purpose:* Boolean state selection. Toggle for immediate effect, Checkbox for form submission.
- **Badge:**
  - *Purpose:* Display static metadata (e.g., status, counts). Non-interactive.
  - *Variants:* Success, Warning, Error, Info, Neutral.
- **Tag / TagBadge:**
  - *Purpose:* Represent the KobeanAI `[prefix-id][action]` system.
  - *States:* Interactive (hoverable, removable) or static.
  - *Visual:* Monospace font, prefix-colored background (10% opacity) + colored border.
- **Tooltip:**
  - *Purpose:* Reveal extra information on hover. Delay 300ms. Dark background (`gray-800`), small text.
- **Avatar:**
  - *Purpose:* Represent users or AI agents visually. Initials or logos, circular shape.

### 7.2 Layout
- **AppShell:** Root container managing Sidebar + Main Content area.
- **Sidebar & SidebarNavItem:** Vertical navigation. Collapsible. Active item highlighted with `color-brand-primary` background (10% opacity).
- **Header:** Top bar containing breadcrumbs, user profile, and global search trigger.
- **PageContainer:** Wrapper for main view content enforcing `max-width` and `gutter`.
- **Card:**
  - *Purpose:* Group related information.
  - *Visual:* `bg-surface`, `border-subtle`, `radius-lg`.
- **Divider:** Subtle horizontal or vertical line (`border-subtle`) to separate content blocks.
- **Section:** Grouping component for forms and settings with a title and description.

### 7.3 Feedback
- **Toast:** Non-blocking temporal notification at bottom-right.
- **Alert:** Inline block notification for errors or warnings within the flow.
- **Spinner:** Minimalist SVG loading indicator (`color-brand-primary`).
- **Skeleton:** Placeholder for loading data. Uses the `shimmer` animation over `bg-surface-hover`.
- **ProgressBar:** For upload/sync processes.
- **EmptyState:** Graphic/Icon + Title + Description + Primary Action (CTA). Centered in container.

### 7.4 Navigation
- **Breadcrumb:** Shows current depth in the UI (e.g., `Skills / code-review-expert`).
- **Tabs:** Horizontal navigation within a page. Active tab has an underline (`border-brand-primary`).
- **Stepper:** For the Setup Wizard. Circles connected by lines. Active step is blue, completed is green with a checkmark.

### 7.5 Data Display
- **DataTable:** Sortable headers, zebra striping optional, sticky header.
- **List / ListItem:** Vertical stacking of sessions or rules.
- **TagCloud:** Visual distribution of tags; font size maps to frequency.
- **StatCard:** Large numeric value + label + trend indicator (e.g., Token Usage).
- **ChartContainer:** Wrapper for Recharts/Chart.js ensuring responsive sizing and theme adoption.

### 7.6 Overlays
- **Modal:** Center-screen dialog. Glassmorphism backdrop. Max-width `500px` for standard, `800px` for complex.
- **Drawer:** Slide-in panel from the right edge for editing details without losing context (e.g., editing a Skill).
- **Dropdown:** Context menu attached to a button or IconButton.
- **CommandPalette:** Global search and execution overlay (`Cmd+K`). Center screen, prominent search input, list of navigable results.
- **Popover:** Small informational overlay attached to a trigger element (complex tooltip).

### 7.7 Domain Specific Components
- **TagInput:** Specialized input that auto-formats strings into `[prefix-id][action]` and auto-suggests based on existing tags.
- **AgentStatusCard:** Card displaying agent logo, name, connection status dot (green/red), and last sync time.
- **SessionCard:** List item for a session showing tags, duration, token count, and a snippet of the summary.
- **SkillCard:** Grid item showing skill name, description, usage count, and supported agent logos.
- **WizardStep:** Container for individual setup wizard content, orchestrating validation before 'Next'.

---

## 8. Page Layouts

### 8.1 App Shell
- **Structure:** CSS Grid
- **CSS:** `grid-template-columns: var(--layout-sidebar-width) 1fr; grid-template-rows: var(--layout-header-height) 1fr;`
- **Areas:**
  - Sidebar: column 1, row 1 to 2
  - Header: column 2, row 1
  - Content: column 2, row 2

### 8.2 Setup Wizard
- **Structure:** Flexbox / Grid
- **Layout:** Centered content on a dark background.
- **Container:** `max-width: 800px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;`
- **Components:** Top Stepper component, Main Card for step content, Bottom navigation (Back/Next).

### 8.3 Dashboard
- **Structure:** CSS Grid (Masonry or predefined grid areas)
- **Layout:** 
  - Top row: 4 StatCards (Usage summaries)
  - Middle row: ChartContainer (Usage over time) + TagCloud (2/3 and 1/3 split)
  - Bottom row: Activity Feed list + Active Agents list

### 8.4 Sessions
- **Structure:** Split Pane (Flexbox or CSS Grid)
- **Layout:**
  - Left pane (40% width): Scrollable List View of SessionCards, with sticky filter bar at top.
  - Right pane (60% width): Detailed view of the selected session. Sticky header.
  - **CSS:** `display: grid; grid-template-columns: 350px 1fr; height: 100%;`

### 8.5 Skills
- **Structure:** Grid layout + Drawer
- **Layout:** 
  - Main area: Search/Filter bar above a CSS Grid of SkillCards (`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`).
  - Editing: Opens a Drawer overlay sliding from the right edge containing the Skill editor form.

### 8.6 Settings
- **Structure:** Flexbox row + column
- **Layout:**
  - Left sidebar (local to Settings): Navigation links (General, Agents, Data, Rules).
  - Main area: Stacked Section components containing forms. `max-width: 600px;` to ensure forms are readable.

---

## 9. Iconography

- **Library:** Lucide React
- **Stroke Width:** `2px` for clarity on dark backgrounds.
- **Sizes:**
  - `sm`: 16x16px (inline with text-sm, tags)
  - `md`: 20x20px (default for buttons, sidebar navigation)
  - `lg`: 24x24px (header actions, empty states)
- **Color Conventions:**
  - Navigation inactive: `var(--color-text-tertiary)`
  - Navigation active: `var(--color-brand-primary)`
  - Action icons default: `var(--color-text-secondary)`
  - Action icons hover: `var(--color-text-primary)`
  - Destructive icons: `var(--color-status-error)`
