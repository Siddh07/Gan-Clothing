---
name: design-taste-frontend
description: Strict editorial, high-contrast, anti-slop visual frontend guidelines for Gan-Clothing (B2B Apparel Sourcing Portal) using Next.js App Router, React 19, and Tailwind CSS v4.
---

# Gan-Clothing Visual Frontend Design Skill & System Rules

## 1. Core Paradigm: Moderno B2B Editorial Architecture

This ruleset governs all UI/UX generation, refactoring, and component authoring for the **Garment Association of Nepal (GAN) / Gan-Clothing** B2B apparel portal. The aesthetic is inspired by high-end luxury manufacturing catalogs and editorial industry registries (e.g., House of Blanks, SSENSE B2B, Vitra, and industrial trade registries).

---

## 2. Anti-Slop Visual Directives (Strictly Enforced)

### Forbidden Design Patterns:
- ❌ **NO Generic Centered Hero Blocks**: Never render centered headline + centered subhead + two centered floating pill buttons over an empty background or abstract gradient glow.
- ❌ **NO Predictable 3-Column Feature Grids**: Do not generate the ubiquitous 3-card row with generic colored icons in rounded squares.
- ❌ **NO Bulbous / Cartoonish Geometry**: Do not use `rounded-2xl`, `rounded-3xl`, or `rounded-full` on cards, panels, inputs, or primary action buttons.
- ❌ **NO Soft Low-Contrast Neumorphism / Purple Glows**: No rainbow gradients, no violet-to-pink glows, no frosted glass cards with fuzzy borders.
- ❌ **NO Placeholder Marketing Copy**: Every metric, label, and copy block must reflect genuine international apparel manufacturing and export terminology (e.g., FOB Kathmandu, LDC duty-free preferences, GSM specs, gauge knit, lead times, MOQ tiers).

### Mandatory Aesthetic Standards:
- ✅ **Asymmetric, Content-Dense Grid Architecture**:
  - Split layouts (e.g., 7:5, 8:4, or staggered editorial column bands).
  - High-density information blocks inspired by trade sheets, customs manifests, and technical specification indices.
- ✅ **Left-Aligned Content Clusters**: Anchor headlines, metadata markers, badges, and action triggers to clear structural vertical axes.
- ✅ **Precision Geometry & Sharp Edges**:
  - Maximum corner radius: **4px** (`rounded` or `rounded-sm`/`rounded-md` max).
  - Clean 1px solid structural borders (`border-[#E4E4E7]` / `border-neutral-200`).
  - Architectural hairline separators dividing data groups instead of heavy card drop-shadows.
- ✅ **Typography & Contrast**:
  - Primary font: IBM Plex Sans (`var(--font-sans)`); Monospace font: IBM Plex Mono (`var(--font-mono)`).
  - Strict tracking: `tracking-tight` on display headers, `tracking-wide` with uppercase on micro-labels / table headers.
  - Tabular figures (`font-feature-settings: "tnum" 1`) for all numbers, pricing, capacities, and statistics.
- ✅ **Curated Monochromatic Palette**:
  - Canvas: `#F8F8F6` (subtle warm neutral) / Pure White (`#FFFFFF`).
  - Typography: Deep Ink Charcoal (`#18181B` / `#1A1A1A`) for headers, `#52525B` / `#71717A` for metadata.
  - Borders: Crisp Neutral `#E4E4E7` / Subtle `#F3F4F6`.
  - Accent: High-precision Royal Blue (`#2D5BE3`, hover `#2650CC`) reserved strictly for interactive primary actions and verified indicators.

---

## 3. Preservation of Application State & Engineering Integrity

Under no circumstances may aesthetic improvements break or drop backend connections:

1. **Server Actions (`src/actions/`)**:
   - All server actions (`admin.ts`, `apply.ts`, `auth-reset.ts`, `import.ts`, `inquiry.ts`, `mfa.ts`, `portal.ts`, `rfq.ts`) must retain 100% of parameter contracts, validations, and revalidation hooks.
2. **TypeScript Contracts (`src/types/`)**:
   - Strictly honor existing domain interfaces in `src/types/index.ts`, `src/types/inquiry.ts`, and `src/types/next-auth.d.ts`.
3. **Prisma & Data Layer**:
   - Preserve database query pipelines, relation includes, counts, aggregates, and caching/revalidation tags (`export const revalidate`).
4. **Context & Shell Providers**:
   - Maintain root provider hierarchy: `AuthProvider` (`@/components/providers/AuthProvider`), `QuoteCartProvider` (`@/context/QuoteCartContext`), and `QuoteCartDrawer`.
5. **SEO & Structured Data**:
   - Preserve all JSON-LD schemas (`WebSiteJsonLd`, `GanOrganizationJsonLd`, `OrganizationJsonLd`) and OpenGraph metadata configurations.

---

## 4. Component Layout Guidelines

- **Navigation & Headers**: Clean border-bottom rule, ultra-crisp monospaced micro-badges, compact navigation links with explicit hover transitions.
- **Product & Factory Display**: Strict editorial grids, high-contrast specimen thumbnails, technical specification tables, and live multi-tier volume pricing matrices.
- **Form Elements**: Crisp 4px borders, zero floating labels, high-legibility field labels with inline helper badges, and immediate validation feedback.
