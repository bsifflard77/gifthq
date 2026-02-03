# GiftHQ Brand Guide

**Version:** 1.0
**Updated:** 2026-02-02

---

## Logo

### Primary Logo
The GiftHQ logo features a **magnifying glass** with a **red gift box** (yellow/gold ribbon) inside. This represents "finding the perfect gift."

### Logo Variations
| Variant | File | Use Case |
|---------|------|----------|
| Full Logo | `/public/gifthq-logo-v3.jpg` | Navigation, hero |
| **Clean (No Tagline)** | `/public/gifthq-logo-clean.jpg` | Pinterest, social profiles |
| Icon Only | `/public/gifthq-icon.png` | Favicon, app icon |
| Stacked | `/public/gifthq-stacked.png` | Marketing materials |

### Logo Backgrounds
- **Light mode:** Use on cream (#FFF9F5) or white backgrounds
- **Dark mode:** Use on navy slate (#3D4F5F) backgrounds
- Ensure sufficient contrast in all applications

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Use |
|------|-----|-----|-----|
| **Navy Slate** | `#3D4F5F` | 61, 79, 95 | Primary brand, text, buttons |
| **Navy Light** | `#4A5D6E` | 74, 93, 110 | Hover states |
| **Navy Dark** | `#2D3D4B` | 45, 61, 75 | Gradients, footer |

### Accent Colors

| Name | Hex | RGB | Use |
|------|-----|-----|-----|
| **Gift Red** | `#E74C3C` | 231, 76, 60 | CTAs, highlights, gift box |
| **Red Light** | `#EC6B5E` | 236, 107, 94 | Hover states |
| **Red Dark** | `#C0392B` | 192, 57, 43 | Active states |
| **Gold** | `#F4C430` | 244, 196, 48 | Ribbon, accents, "HQ" text |
| **Gold Light** | `#F7D154` | 247, 209, 84 | Hover states |
| **Gold Dark** | `#D4A912` | 212, 169, 18 | Active states |

### Semantic Colors

| Name | Hex | Use |
|------|-----|-----|
| **Success** | `#26DE81` | Bought status, confirmations |
| **Warning** | `#F4C430` | In cart, pending |
| **Info** | `#4ECDC4` | Ideas, tips |
| **Error** | `#E74C3C` | Errors, alerts |

### Background Colors

| Name | Hex | Use |
|------|-----|-----|
| **Cream** | `#FFF9F5` | Page background |
| **White** | `#FFFFFF` | Cards, surfaces |
| **Light Gray** | `#F8FAFC` | Alternate sections |
| **Navy BG** | `#3D4F5F` | Dark sections |

---

## Typography

### Font Stack
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Hierarchy
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| H1 | 48-72px | Bold (700) | Navy Slate |
| H2 | 36-48px | Bold (700) | Navy Slate |
| H3 | 24-30px | Semibold (600) | Navy Slate |
| Body | 16-18px | Regular (400) | Navy Slate |
| Small | 14px | Regular (400) | Muted (#5A6C7D) |

### Logo Text
- "Gift" in Navy Slate (#3D4F5F)
- "HQ" in Gold (#F4C430)
- Font weight: Bold (700)
- Letter spacing: Tight (-0.02em)

---

## UI Components

### Buttons

**Primary (Navy)**
```css
background: #3D4F5F;
color: white;
border-radius: 9999px; /* pill shape */
padding: 12px 24px;
```

**Secondary (Red CTA)**
```css
background: #E74C3C;
color: white;
border-radius: 9999px;
```

**Outline**
```css
background: transparent;
border: 2px solid #3D4F5F;
color: #3D4F5F;
border-radius: 9999px;
```

### Cards
```css
background: white;
border-radius: 16px;
box-shadow: 0 4px 20px rgba(0,0,0,0.05);
border: 1px solid #E5E7EB;
```

### Input Fields
```css
border: 1px solid #D1D5DB;
border-radius: 12px;
padding: 12px 16px;
focus: border-color: #3D4F5F;
```

---

## Iconography

### Style Guidelines
- Line weight: 2px
- Corner radius: Rounded
- Style: Outline preferred, filled for active states

### Emoji Usage
GiftHQ uses emoji strategically for warmth:
- 🎁 Gift-related
- 🎄 Christmas
- 🎂 Birthdays
- 💝 Valentine's
- ✓ Success states

---

## Photography & Imagery

### Style
- Warm, inviting imagery
- Focus on gifting moments
- Natural lighting preferred
- Avoid overly corporate/stock-looking images

### Overlay Treatment
When text overlays images:
- Use navy gradient overlay
- Ensure WCAG AA contrast minimum

---

## Voice & Tone

### Brand Personality
- **Helpful** — We simplify gifting
- **Warm** — Gifts are emotional
- **Organized** — We bring order to chaos
- **Smart** — AI-powered suggestions

### Writing Guidelines
- Use active voice
- Be concise and clear
- Address users directly ("you")
- Celebrate the joy of gifting

### Example Copy
✅ "Never buy a duplicate gift again"
✅ "Your gift command center"
✅ "Plan smarter. Gift better."

❌ "GiftHQ is a comprehensive gift management platform"
❌ "Leverage our solution for optimized gifting outcomes"

---

## CSS Variables

Copy these to your CSS:

```css
:root {
  --color-navy: #3D4F5F;
  --color-navy-light: #4A5D6E;
  --color-navy-dark: #2D3D4B;
  --color-gift-red: #E74C3C;
  --color-gift-red-light: #EC6B5E;
  --color-gift-red-dark: #C0392B;
  --color-ribbon: #F4C430;
  --color-ribbon-light: #F7D154;
  --color-ribbon-dark: #D4A912;
  --color-background: #FFF9F5;
  --color-surface: #FFFFFF;
  --color-text: #3D4F5F;
  --color-text-muted: #5A6C7D;
}
```

---

## File Assets

### Logos & Icons
- `/public/gifthq-logo-v3.jpg` — Main logo
- `/public/gifthq-icon.png` — App icon
- `/public/apple-touch-icon.png` — iOS icon
- `/public/android-*.png` — Android icons (48-512px)
- `/public/og-image-v2.jpg` — Social sharing

### Brand Kit Source
- `/public/branding/` — Full brand identity kit variations

---

*GiftHQ Brand Guide v1.0 — February 2026*
