# Rtios AI Design System

> **Version:** 1.0  
> **Last Updated:** December 19, 2025

---

## 1. Color System

### Semantic Colors

| Token | Hex | Usage | Contrast Ratio |
|-------|-----|-------|----------------|
| `surface-base` | `#121212` | App background | — |
| `surface-elevated` | `#1A1A1A` | Cards, sidebars | — |
| `surface-overlay` | `#242424` | Modals, dropdowns | — |
| `text-primary` | `#F0F0F0` | Headlines, body text | 14.1:1 ✅ |
| `text-secondary` | `#B8B8B8` | Labels, captions | 7.2:1 ✅ |
| `text-tertiary` | `#888888` | Hints, disabled | 4.5:1 ✅ |
| `text-placeholder` | `#9A9A9A` | Input placeholders | 5.3:1 ✅ |
| `accent` | `#00FF7F` | CTAs, active states | 12.8:1 ✅ |
| `accent-hover` | `#00CC66` | Hover state for accent | 9.1:1 ✅ |
| `accent-muted` | `rgba(0,255,127,0.1)` | Accent backgrounds | — |
| `alert-gap` | `#FF6B6B` | Errors, gaps, warnings | 5.2:1 ✅ |
| `alert-warning` | `#FFB347` | Warnings, caution | 8.9:1 ✅  |
| `alert-success` | `#4ADE80` | Success states | 10.4:1 ✅ |

### Border Colors

| Token | Value |
|-------|-------|
| `border-subtle` | `rgba(255, 255, 255, 0.05)` |
| `border-default` | `rgba(255, 255, 255, 0.1)` |
| `border-focus` | `#00FF7F` |

---

## 2. Typography

### Font Families

| Token | Font Stack | Usage |
|-------|------------|-------|
| `font-tiempos` | `"Playfair Display", serif` | Headlines, editorial |
| `font-interstate` | `"JetBrains Mono", monospace` | Labels, buttons, data |
| `font-sans` | `"Inter", sans-serif` | Body text, UI |

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Hero | `text-5xl md:text-7xl` | Bold | 1.1 | Landing hero |
| H1 | `text-3xl md:text-4xl` | Bold | 1.2 | Section headers |
| H2 | `text-xl` | Bold | 1.3 | Card headers |
| H3 | `text-lg` | Bold | 1.4 | Subsections |
| Body | `text-sm` | Regular | 1.6 | Paragraphs |
| Label | `text-xs` | Bold | 1.5 | Form labels |
| Caption | `text-[10px]` | Regular | 1.4 | Hints, metadata |

---

## 3. Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Tight spacing |
| `2` | 8px | Component internal |
| `3` | 12px | Related elements |
| `4` | 16px | Default gap |
| `6` | 24px | Section padding |
| `8` | 32px | Card padding |
| `12` | 48px | Major sections |
| `16` | 64px | Page sections |

---

## 4. Component Specifications

### Buttons

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| Primary | `bg-accent` | `text-surface-base` | none | `bg-accent-hover` |
| Secondary | `bg-surface-elevated` | `text-text-primary` | `border-white/10` | `border-white/20` |
| Ghost | transparent | `text-text-secondary` | none | `bg-white/5` |
| Danger | `bg-alert-gap/10` | `text-alert-gap` | none | `bg-alert-gap/20` |

**Sizes:**
- **sm:** `px-3 py-1.5 text-xs`
- **md:** `px-4 py-2 text-xs`
- **lg:** `px-6 py-3 text-sm`

### Inputs

```css
/* Base input styling */
.input-base {
  @apply w-full bg-transparent text-text-primary;
  @apply border-b-2 border-white/10;
  @apply focus:border-accent focus:outline-none;
  @apply py-2 px-1;
  @apply placeholder:text-text-placeholder;
  @apply transition-colors;
}
```

### Cards

```css
.card {
  @apply bg-surface-elevated;
  @apply border border-white/5;
  @apply p-6;
  @apply hover:border-accent/30;
  @apply transition-colors;
}
```

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | `< 640px` | Bottom nav, drawer sidebar |
| Tablet | `640px - 1024px` | Compact layout |
| Desktop | `1024px - 1280px` | Full 3-pane layout |
| Wide | `> 1280px` | Expanded sidebar |

### Mobile Patterns

- **Navigation:** Bottom bar with icons
- **Right Sidebar:** Slide-in drawer from right
- **Modals:** Full-screen on mobile

---

## 6. Animation & Transitions

| Property | Duration | Easing |
|----------|----------|--------|
| Color transitions | `150ms` | `ease-out` |
| Transform | `300ms` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Opacity | `200ms` | `ease-in-out` |
| Slide (drawer) | `300ms` | `ease-out` |

### Standard Animations

```css
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 7. Accessibility Requirements

### Minimum Requirements

- ✅ All text must meet **WCAG 2.2 AA** contrast ratios (4.5:1 for body, 3:1 for large text)
- ✅ Touch targets minimum **44x44px** on mobile
- ✅ Focus rings visible on all interactive elements (`outline: 2px solid accent`)
- ✅ All interactive elements keyboard accessible

### Focus States

```css
*:focus-visible {
  outline: 2px solid #00FF7F;
  outline-offset: 2px;
}
```

---

## 8. Icons

**Library:** [Lucide React](https://lucide.dev/icons/)

### Standard Sizes

| Context | Size |
|---------|------|
| Navigation | `w-5 h-5` |
| Inline with text | `w-4 h-4` |
| Feature icons | `w-6 h-6` |
| Empty states | `w-8 h-8` |

---

## 9. Tailwind Config Reference

```js
// tailwind.config.cjs
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface-base': '#121212',
        'surface-elevated': '#1A1A1A',
        'surface-overlay': '#242424',
        'text-primary': '#F0F0F0',
        'text-secondary': '#B8B8B8',
        'text-tertiary': '#888888',
        'text-placeholder': '#9A9A9A',
        'accent': '#00FF7F',
        'accent-hover': '#00CC66',
        'accent-muted': 'rgba(0, 255, 127, 0.1)',
        'alert-gap': '#FF6B6B',
        'alert-warning': '#FFB347',
        'alert-success': '#4ADE80',
        'border-subtle': 'rgba(255, 255, 255, 0.05)',
        'border-default': 'rgba(255, 255, 255, 0.1)',
        'border-focus': '#00FF7F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        tiempos: ['"Playfair Display"', 'serif'],
        interstate: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
};
```
