---
name: Cyber-Forge Industrial
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#1f1f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e4e2e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e4e2e4'
  inverse-on-surface: '#303032'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#fdf2ff'
  on-tertiary: '#490080'
  tertiary-container: '#eacfff'
  on-tertiary-container: '#842bd2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#131315'
  on-background: '#e4e2e4'
  surface-variant: '#353437'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a high-performance 3D printing environment, targeting technical professionals and hardware innovators. The brand personality is precise, advanced, and reliable, evoking the atmosphere of a high-tech fabrication lab at night.

The visual style merges **Minimalism** with **Glassmorphism** and **High-Contrast** accents. By utilizing deep charcoal foundations and neon light-emissive accents, the UI directs focus toward 3D models and technical parameters. The aesthetic maintains a "heads-up display" (HUD) feel—highly functional yet visually striking—emphasizing clarity in complex data environments.

## Colors

The palette is rooted in a "True Dark" philosophy to minimize eye strain during long engineering sessions and to make the neon accents pop.

- **Primary (Neon Cyan):** Used for critical actions, active states, and successful build indicators. It represents the "laser" precision of the printing process.
- **Secondary (Electric Blue):** Used for secondary interactions, links, and informative data visualizations.
- **Background:** A deep, near-black charcoal (#0A0A0B) provides the void.
- **Surface:** A slightly lighter charcoal (#161618) creates clear containment for cards and navigation modules.
- **Status Colors:** Use a pure Magenta (#FF00E5) for alerts and a deep Slate (#475569) for disabled or inactive hardware states.

## Typography

This design system utilizes a trio of typefaces to delineate hierarchy and function. **Geist** provides a sharp, technical edge for headings. **Inter** is the workhorse for all interface text, ensuring maximum legibility. **JetBrains Mono** is reserved strictly for coordinate data, G-code, and technical specifications, providing a clear visual distinction for "machine data."

Keep line lengths for technical descriptions under 65 characters to maintain focus. Use `label-caps` for table headers and small metadata tags to create a structured, tabular feel.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The spacing rhythm is based on a 4px baseline, ensuring all components align to a technical grid.

- **Desktop:** 48px outer margins with 24px gutters. Cards should generally span 3, 4, or 6 columns.
- **Mobile:** 16px outer margins with 16px gutters. Most content should stack vertically in a single column.
- **Density:** Technical dashboards should use "Compact" spacing (stack-sm), while landing pages and marketing views use "Comfortable" spacing (stack-lg) to allow the high-tech visuals room to breathe.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Glassmorphism**, rather than traditional heavy shadows.

- **Level 0 (Background):** #0A0A0B. The base canvas.
- **Level 1 (Cards/Panels):** #161618. Subtle 1px border (#ffffff10) to define edges.
- **Level 2 (Overlays/Modals):** Background blur (20px) with 60% opacity of the surface color. Use a primary-tinted "glow" shadow (0px 0px 20px #00F0FF20) for active modal states.
- **Interaction:** Hovering over a card should increase the border opacity and slightly brighten the background-tint to indicate focus.

## Shapes

The shape language is "Soft-Technical." By using a consistent 0.25rem (4px) corner radius, the UI feels precise and engineered without being aggressive. 

Large-scale interactive elements like buttons or primary cards use the `rounded-lg` (0.5rem) setting to feel slightly more approachable, while internal elements like input fields and tags stick to the base `rounded` (0.25rem) setting. Avoid pill-shaped buttons; maintaining rectangular forms reinforces the industrial, structured nature of 3D manufacturing.

## Components

- **Buttons:** Primary buttons use a solid Neon Cyan (#00F0FF) fill with black text. Secondary buttons use a ghost style: 1px Cyan border with Cyan text. Include a "glow" effect on hover using a soft cyan outer shadow.
- **Inputs:** Dark backgrounds (#0A0A0B) with a subtle 1px border. On focus, the border transitions to Neon Cyan and the label shifts to the accent color. Use mono-fonts for numerical inputs (dimensions, temperature).
- **Cards:** Glassmorphic appearance. 1px stroke (#ffffff15). For featured items, add a top-border highlight in Primary Cyan.
- **Progress Bars:** Use a "scanning" animation for active prints. A gradient from Secondary Blue to Primary Cyan moving across the bar provides a sense of activity.
- **Status Chips:** High-contrast, small-scale labels. "Printing" uses a pulsing Cyan dot; "Paused" uses an Amber dot; "Complete" uses a solid Cyan checkmark.
- **3D Viewer Container:** Always use the deepest background (#000000) for 3D viewports to maximize the contrast of the model wireframes.