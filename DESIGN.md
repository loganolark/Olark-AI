---
name: Olark.ai
description: AI sales chat that enhances the human moment, not replaces it.
colors:
  od-dark: "#0F0D2E"
  od-navy: "#141250"
  od-card: "#252275"
  od-card-hover: "#2D2B8F"
  od-border: "rgba(120, 115, 220, 0.45)"
  od-gold: "#F5C200"
  od-gold-lt: "#FFD533"
  od-pink: "#E8325A"
  od-pink-lt: "#FF6B8A"
  od-teal: "#00D4AA"
  od-teal-lt: "#00ECBD"
  od-white: "#F0EEFF"
  od-text: "#D8D5F5"
  od-muted: "#A09DD8"
typography:
  display:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  pill: "100px"
  card: "14px"
  surface: "16px"
  control: "12px"
spacing:
  section-y: "5rem"
  section-y-mobile: "3.5rem"
  section-x: "1.5rem"
  section-x-mobile: "1.25rem"
  card-padding: "1.5rem"
components:
  cta-primary:
    backgroundColor: "{colors.od-gold}"
    textColor: "{colors.od-dark}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 1.25rem"
  cta-primary-hover:
    backgroundColor: "{colors.od-gold-lt}"
  cta-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.od-white}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 1.25rem"
  cta-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.od-muted}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 1.25rem"
  pill-gold:
    backgroundColor: "rgba(245,194,0,0.15)"
    textColor: "{colors.od-gold}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.625rem"
  pill-pink:
    backgroundColor: "rgba(232,50,90,0.15)"
    textColor: "{colors.od-pink}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.625rem"
  pill-muted:
    backgroundColor: "rgba(160,157,216,0.12)"
    textColor: "{colors.od-muted}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.625rem"
  card-surface:
    backgroundColor: "{colors.od-card}"
    textColor: "{colors.od-text}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
---

# Design System: Olark.ai

## 1. Overview

**Creative North Star: "Warm Authority"**

Olark.ai dresses serious enterprise software in confident, almost editorial type. The page is dark not because dark "looks tech" but because the brand sells calm in a category full of shouting — a navy-saturated control room where the gold accent is rare enough to mean something. Every surface is a layer of indigo, every accent is a deliberate punctuation mark. The voice is operator-grade: short sentences, em-dashes used as breath, never as filler.

This system explicitly rejects: the SaaS hero-metric template (big number, small label, gradient accent), glassmorphism, light-mode-as-default, neon-on-black "AI" aesthetics, stock-photo people, and the kind of generative landing-page blandness that signals "another AI tool." It also rejects the opposite extreme — overly playful or quirky brand voice that would undermine the enterprise buyer's trust. Confident, not loud. Warm, not casual. Editorial, not cute.

**Key Characteristics:**
- Dark navy palette (#0F0D2E → #141250 → #252275) layered for depth
- Gold (#F5C200) and pink (#E8325A) used sparingly as semantic punctuation
- Poppins 900 with tight letter-spacing for headlines that read like print mastheads
- DM Sans body that breathes (line-height 1.7) — no walls of text
- Em-dashes treated as a brand-voice rhythm device, not as a typographic crutch
- Reduced-motion is a first-class consideration, not an afterthought
- Inline SVG icons over emoji; emoji-as-icon is treated as an AI tell

## 2. Colors: The Navy Control Room

The palette is a single hue family (deep indigo) with two punctuation accents (gold for action, pink for signal). Every neutral is tinted toward the brand hue — there is no `#000` and no `#fff` anywhere in the system.

### Primary
- **Filament Gold** (#F5C200): The primary call-to-action color and the only color allowed on critical primary buttons. Also used as the section-label uppercase rule, the accent on accordion triggers, and the punctuation in pull quotes. Restraint is the point — when the eye sees gold, it should mean *click here* or *read this*.

### Secondary
- **Beacon Pink** (#E8325A): Reserved for *signal* — error states (`URLDemoWidget` validation), routing-priority chips ("Talk to Sales"), problem-tag chips ("Time Lost", "Misdirected"), and the routing visual's primary CTA chip. Used to draw the eye when something is *important and unusual*, never decoratively.

### Tertiary
- **Bright Gold** (#FFD533): Hover state for `Filament Gold` — only used in component hover treatments, never as a standalone accent.

### Tier-Identifier Accents (component-scoped)
These three tokens exist *only* to color the `TierCard` gradient strip — a 4px ribbon at the top of each tier card that gives buyers a fast visual cue for which tier they're looking at. They are **not** general-purpose palette colors and do not appear anywhere else in the system.
- **Bright Pink** (#FF6B8A / `--od-pink-lt`): Lead-Gen tier strip, paired with Beacon Pink in a 90° gradient.
- **Sage Teal** (#00D4AA / `--od-teal`): Commercial tier strip start. The system's only deliberate exception to the Single-Hue Doctrine — scoped to ~4px of card chrome.
- **Mint Teal** (#00ECBD / `--od-teal-lt`): Commercial tier strip end.

### Neutral (the navy ramp)
- **Cosmos Black** (#0F0D2E / `--od-dark`): The deepest surface. Body background, hero, and "rest" sections.
- **Midnight Navy** (#141250 / `--od-navy`): One step up. Section backgrounds that need to feel slightly elevated without becoming a card.
- **Persian Velvet** (#252275 / `--od-card`): Card surfaces, raised panels, and any element that needs to read as "lifted off the page."
- **Persian Velvet Hover** (#2D2B8F / `--od-card-hover`): Card-hover state.
- **Iris Border** (`rgba(120, 115, 220, 0.45)` / `--od-border`): The only border treatment in the system. 1px, semi-transparent purple-tinted line on every card, panel, and divider.
- **Pearl Ice** (#F0EEFF / `--od-white`): Headlines and primary white. Slightly purple-tinted; never `#FFFFFF`.
- **Lavender Mist** (#D8D5F5 / `--od-text`): Body copy. The most-used text color. Tinted enough to feel native to the navy field.
- **Muted Periwinkle** (#A09DD8 / `--od-muted`): Secondary copy, captions, supporting metadata. Lower contrast on purpose — body should read first, captions read second.

### Named Rules
**The Punctuation Rule.** Filament Gold and Beacon Pink combined never cover more than ~10% of any visible viewport. They are punctuation, not paint. If a screen has more than three gold elements competing for attention, one of them is too many.

**The No-Black Rule.** `#000` is forbidden. `#FFFFFF` is forbidden. Every neutral is hue-tinted toward indigo. The eye should never feel a "hole" in the palette where pure black or pure white sits inertly.

**The Single-Hue Doctrine.** The palette is *one* hue family (deep indigo) plus two accents. Resist any pull toward teal, lime, or "tech blue" — even when it might look cool. Coherence is the brand.

## 3. Typography

**Display Font:** Poppins (with system-ui, sans-serif fallback)
**Body Font:** DM Sans (with system-ui, sans-serif fallback)
**Label Font:** DM Sans (uppercase letterspaced)

**Character:** Poppins 900 with -0.03em letter-spacing reads like a print masthead — confident, dense, slightly modernist. DM Sans body provides the editorial breathing room that prevents the page from feeling cramped under the heavy headlines. The contrast between the two weights (900 / 400) is the system's primary hierarchy mechanism.

### Hierarchy
- **Display** (Poppins 900, `clamp(1.75rem, 4.5vw, 2.5rem)`, line-height 1.15, letter-spacing -0.03em): Hero h1, primary section h2s. Always tight, always heavy, never italic.
- **Headline** (Poppins 900, `clamp(1.5rem, 4vw, 2.25rem)`, 1.15, -0.03em): Secondary section h2s when the display weight feels too loud (e.g. inside accordions or constrained columns).
- **Title** (Poppins 700, `1rem`, 1.4, -0.01em): Card titles, list-item h3/h4s. Always semibold, never display weight.
- **Body** (DM Sans 400, `1rem`, 1.7, normal): All paragraph copy. Line-height 1.7 is non-negotiable — the navy field reads heavy without it. Cap line length at 65–75ch on long-form sections.
- **Label** (DM Sans 600, `0.75rem`, 1.2, letter-spacing 0.1em, uppercase, gold): The "section label" eyebrow above every h2. Repeats too often if used on every section — see Aesthetic doctrine below.

### Named Rules
**The Em-Dash Rule.** Em-dashes (`—`, U+2014) are treated as a brand-voice rhythm device, not as an AI tell. They appear deliberately throughout marketing copy and product strings. Override impeccable's default ban on em-dashes for this project. Hyphens-as-em-dash (`--`) are still forbidden.

**The Eyebrow Restraint Rule.** The gold uppercase "section label" pattern (Label scale above) is potent and overusable. Cap it at ~4 instances per page. If a long page demands more sections, drop the label entirely on alternating sections so the eye gets variety.

**The Title-Case for Titles Rule.** Every h1, h2, h3 uses Title Case. Never sentence case. Never ALL CAPS at h-scale (only at Label scale).

## 4. Elevation

The system is **almost flat**. Depth is conveyed by tonal layering of the navy ramp (`--od-dark` → `--od-navy` → `--od-card`), not by drop shadows. Shadows appear in exactly two situations: as the **glow** under a gold primary CTA, and as the **diffuse depth** under the video lightbox modal.

### Shadow Vocabulary
- **CTA Gold Glow** (`box-shadow: 0 0 40px rgba(245,194,0,0.35), 0 4px 16px rgba(0,0,0,0.4)`): Applied only to `cta-primary`. The gold haze announces "this is the action." Removing it would make the button look ordinary — the glow IS the affordance.
- **Modal Backdrop Halo** (`box-shadow: 0 0 60px rgba(245,194,0,0.25)`): Applied to the video lightbox shell. Creates a soft golden vignette behind the playing video so the modal reads as "lifted into a spotlight" rather than "floating in space."

### Named Rules
**The Tonal-Depth Rule.** Surfaces are elevated by stepping up the navy ramp (`--od-dark` → `--od-navy` → `--od-card` → `--od-card-hover`), not by adding shadows. If a card needs to "lift" on hover, change `background-color`, do not add `box-shadow`.

**The Two-Shadow Doctrine.** Only two shadows exist in the system: CTA gold glow and modal backdrop halo. If you find yourself reaching for a third shadow, you're solving the wrong problem — fix the tonal layering instead.

## 5. Components

### Buttons
- **Shape:** Pill (border-radius `100px`).
- **Sizes:** sm (36px) / md (44px, default — WCAG AA touch target) / lg (52px). Never go below 36px; never go above 52px without extraordinary reason.
- **Primary:** Filament gold background, Cosmos Black text. CTA gold glow shadow (see Elevation). Hover lifts to Bright Gold.
- **Secondary:** Transparent background, Pearl Ice text, 1.5px Pearl Ice border. No shadow.
- **Ghost:** Transparent background, Muted Periwinkle text. Used for tertiary navigation and "skip" actions only.
- **Loading state:** Inline CSS spinner replaces label; click events suppressed; aria-disabled stays focusable.

### Pill Badges
- **Shape:** Pill (border-radius `100px`), `0.25rem 0.625rem` padding, 0.75rem font.
- **Variants:** `gold` (action context), `pink` (signal/warning context), `muted` (metadata context).
- **Backgrounds are tinted at 12-15% opacity** of the variant color, with a 1px 30-40% border of the same. Never solid.
- **Optional pulse:** Pre-pended dot with `pulse-dot` keyframe — used sparingly to draw attention to time-sensitive elements (e.g. "Start Today").

### Cards / Containers
- **Corner Style:** 14-16px (use 14px for content cards, 16px for product/audience cards).
- **Background:** `--od-card` (`#252275`).
- **Shadow Strategy:** None (flat-by-default, see Elevation).
- **Border:** 1px Iris Border (`rgba(120, 115, 220, 0.45)`).
- **Internal Padding:** `1.5rem` for content cards; `1.75rem` for product cards.
- **Hover (when interactive):** Lift -2px translateY, brighten border to gold. Never add shadow.

### Inputs / Fields
- **Style:** 1.5px solid Iris Border, transparent background, Pearl Ice text.
- **Border-radius:** 12px.
- **Focus:** Border shifts to Filament Gold; outer 2px gold focus ring.
- **Error:** Border shifts to Beacon Pink; inline pink helper copy below the field.

### Navigation (`SiteNav`)
- **Style:** Sticky top, navy background with subtle border-bottom. Pill-shaped CTAs in the right cluster.
- **Mobile:** Drawer pattern with slide-in animation; close button in top-right with proper focus trap.

### Timelines / Step Lists
- **CrawlWalkRunTimeline:** Accordion pattern with phase pills as triggers. Collapsed by default — gives buyers a way to skim. Single-source affordance for "see the implementation timeline without committing to read all 7 steps."

### Inline Icons (`CommercialIcon`)
- **Style:** 20×20 viewBox, stroke-1.5, stroke-linecap round, stroke-linejoin round, currentColor.
- **Background container:** Tinted variant color (gold 12% / pink 10%) with 8-10px border-radius, 32-40px square.
- **Decorative by default** (`aria-hidden="true"` + `role="presentation"`); accept optional `aria-label` for standalone use.
- **Always inline SVG.** Never emoji-as-icon. Never icon-font.

### Video Lightbox (`VideoLightbox`)
- **Pattern:** Modal dialog with backdrop blur. Lazy-mounted iframe — no Wistia network requests until open.
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to a visually-hidden h2, focus trap between close button and iframe, ESC and backdrop click both close.
- **Backdrop:** `rgba(15, 13, 46, 0.92)` + `backdrop-filter: blur(8px)`.
- **Modal halo:** Gold backdrop glow (see Elevation).

## 6. Do's and Don'ts

### Do:
- **Do** use the navy ramp (`--od-dark` → `--od-navy` → `--od-card`) for depth instead of shadows.
- **Do** treat Filament Gold as semantic — it means *action*. Beacon Pink means *signal*.
- **Do** use Poppins 900 with -0.03em letter-spacing for every h1 and h2.
- **Do** cap line length at 65–75ch on long-form copy.
- **Do** respect `prefers-reduced-motion: reduce` — every animation must short-circuit to its final state.
- **Do** use inline SVG for icons; lift `CommercialIcon` and extend the family before reaching for emoji.
- **Do** use em-dashes deliberately as a brand-voice rhythm device.
- **Do** ensure every interactive element meets WCAG AA touch targets (44×44px minimum at default `md` size).
- **Do** use `next/image` for any new image asset; raw `<img>` only for external poster swatches that can't be configured into `next.config.js`.

### Don't:
- **Don't** use `border-left` / `border-right` greater than 1px as a colored accent. The "side-stripe" pattern is the most recognizable AI tell — full borders, background tints, or no decoration at all.
- **Don't** use `#000000` or `#FFFFFF` anywhere. Every neutral is hue-tinted toward indigo.
- **Don't** use emoji as icons. Use the `CommercialIcon` SVG family.
- **Don't** use bounce or elastic easing — only exponential (`cubic-bezier(0.16, 1, 0.3, 1)` is the house curve).
- **Don't** use gradient text (`background-clip: text` over a gradient). Single solid colors only; emphasis via weight or size.
- **Don't** use glassmorphism / blur cards as decorative chrome. The video lightbox backdrop blur is the only sanctioned use.
- **Don't** copy the SaaS hero-metric template (big number, small label, supporting stats). Find a different shape for "credibility proof."
- **Don't** stack identical card grids more than twice on a single page. Vary visual rhythm.
- **Don't** introduce a light-mode variant. The brand is intentionally mono-theme dark.
- **Don't** synthesize new colors outside the existing token system. If a color need can't be expressed in the existing palette, the design problem is wrong, not the palette.
- **Don't** use the "section label" gold uppercase eyebrow more than 4 times on a single page.
- **Don't** have more than 3 terminal CTAs on a single page. The buyer should know the *one* next step.
