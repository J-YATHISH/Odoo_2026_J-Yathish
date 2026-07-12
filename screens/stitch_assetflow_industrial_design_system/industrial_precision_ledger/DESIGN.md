---
name: Industrial Precision Ledger
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#d7c3af'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#a08e7b'
  outline-variant: '#524435'
  surface-tint: '#ffb961'
  primary: '#ffc176'
  on-primary: '#472a00'
  primary-container: '#f0a030'
  on-primary-container: '#613b00'
  inverse-primary: '#865300'
  secondary: '#9acbff'
  on-secondary: '#003355'
  secondary-container: '#024a79'
  on-secondary-container: '#87b9ef'
  tertiary: '#72e0be'
  on-tertiary: '#00382b'
  tertiary-container: '#54c4a4'
  on-tertiary-container: '#004e3d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb961'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#663e00'
  secondary-fixed: '#d0e4ff'
  secondary-fixed-dim: '#9acbff'
  on-secondary-fixed: '#001d34'
  on-secondary-fixed-variant: '#024a79'
  tertiary-fixed: '#89f7d4'
  tertiary-fixed-dim: '#6cdab8'
  on-tertiary-fixed: '#002118'
  on-tertiary-fixed-variant: '#00513f'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  headline-lg:
    fontFamily: IBM Plex Sans Condensed
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: IBM Plex Sans Condensed
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 16px
  label-sm:
    fontFamily: IBM Plex Sans Condensed
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  margin-page: 24px
  gutter-table: 12px
  sidebar-width: 240px
  density-xs: 4px
  density-sm: 8px
  density-md: 16px
---

## Brand & Style
The design system is engineered to feel like a high-precision industrial instrument rather than a standard software application. It draws heavy inspiration from engraved metal equipment plates, warehouse manifests, and logistics ledger books. 

The aesthetic is rooted in **Industrial Brutalism**—prioritizing density, legibility, and structural integrity. Every element must feel "machined." We avoid all decorative flourishes, relying on a strict 1px grid alignment and a utilitarian ethos. The goal is to evoke a sense of absolute reliability and mechanical precision for professionals managing complex physical asset flows.

## Colors
The palette is dominated by **Deep Graphite** and **Muted Steel**, creating a low-light environment that reduces eye strain in industrial settings. The **Industrial Amber** primary color is used exclusively for actionable signals and critical focus points, mimicking physical warning lights and brass accents.

Status colors are desaturated to ensure they don't overpower the data. All interactive states should be represented by shifts in border intensity or tonal steps rather than vibrant color fills.

## Typography
Typography is the primary vehicle for the "ledger" feel. 
- **IBM Plex Sans Condensed** is used for all UI headers and labels to maximize horizontal space and provide a technical, engineered appearance.
- **IBM Plex Mono** is strictly reserved for data values: serial numbers, timestamps, quantities, and IDs. This ensures vertical alignment of digits in tables.
- **IBM Plex Sans** provides a legible, neutral base for paragraph text and documentation.
- **No negative tracking:** All fonts must maintain their natural letter spacing to ensure maximum readability in high-density environments.

## Layout & Spacing
The layout follows a **Fixed-Grid** logic within its major containers.
- **Sidebar:** A persistent 240px navigation bar.
- **Data Tables:** These are the heart of the system. Use high-density row heights (32px or 36px) with 1px hairline borders between every row.
- **Grids:** Use a 4px baseline grid. Padding within components should be lean—preferring 8px or 12px over larger whitespace.
- **Alignment:** All content must be hard-aligned to the left or right; avoid center alignment in data contexts.

## Elevation & Depth
Depth is achieved through **Tonal Stepping** and **Hairline Outlines**, never through shadows.
- **Level 0 (Background):** #15171A. Used for the main application canvas.
- **Level 1 (Surface):** #1D2023. Used for cards, panels, and table headers.
- **Borders:** All surfaces are defined by a 1px solid border (#2C3033). 
- **InsetLayouts:** For nested elements, use a slightly darker fill or a double-border effect to imply a "milled" or "recessed" area in the interface.

## Shapes
Shapes are defined by sharp geometry. 
- **Standard Radius:** 4px maximum for buttons and cards to prevent the UI from feeling "sharp-edged" while maintaining an industrial profile.
- **Status Tags:** Must be 0px (sharp) or 2px radius. 
- **Separators:** 1px solid lines only. No dashed lines or gradients.

## Components
- **Buttons:** Primary buttons use a solid #F0A030 background with black text. Secondary buttons use a #2C3033 border with white text. Use square corners.
- **Status Tags:** Rectangular blocks of color with an uppercase label in **IBM Plex Sans Condensed**. No rounded pills.
- **Navigation:** The active state in the sidebar is marked by a 4px wide Industrial Amber (#F0A030) bar on the extreme left edge of the menu item.
- **Input Fields:** Dark background (#15171A) with a persistent #2C3033 border. On focus, the border changes to the Primary Accent color.
- **Data Tables:** Zebra striping is not used. Instead, use 1px horizontal dividers. Hover states on rows should use a slight tonal lift (e.g., changing background to #25282C).
- **Icons:** Use Lucide icons at 16px or 18px size. Pair with text labels wherever possible to ensure technical clarity.