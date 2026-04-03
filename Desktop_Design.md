# Design System Document: The Meditative Manuscript

## 1. Overview & Creative North Star
### Creative North Star: "The Meditative Manuscript"
This design system rejects the "app-as-a-utility" trope in favor of "app-as-an-experience." It is a digital translation of high-end Japanese editorial design—think *Monocle* magazine meets a Kyoto calligraphy studio. The goal is to facilitate deep "flow" states for language learners by removing the cognitive noise of traditional UI.

We achieve a premium feel through **Intentional Asymmetry** and **Ma (Negative Space)**. By utilizing extreme typography scales and abandoning structural lines, we create a layout that feels curated rather than generated. The interface should feel like heavy, textured paper where information is "placed," not "contained."

---

## 2. Colors & Tonal Depth
The color story is a dialogue between the ink-like depth of focused study and the ethereal lightness of *washi* paper.

### The "No-Line" Rule
**Prohibit the use of 1px solid borders for sectioning.** Structural definition must be achieved through:
- **Tonal Shifts:** Placing a `surface-container-low` (#f2f4f6) element against the `surface` (#f8f9fb) background.
- **Soft Shadows:** Using tinted, diffused shadows to imply separation.
- **Negative Space:** Using the spacing scale to create distinct "islands" of content.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of paper. Use the Material Design surface tiers to define importance:
- **Background (`surface` #f8f9fb):** The base washi paper.
- **Lowest Importance (`surface-container-low` #f2f4f6):** Sub-navigation or subtle grouping.
- **Standard Importance (`surface-container` #edeef0):** Main content areas or tertiary cards.
- **High Importance (`surface-container-lowest` #ffffff):** Use this for "Hero" cards to make them pop with a bright, crisp lift against the off-white background.

### The "Signature Stroke" Gradient
To move beyond flat UI, all primary Call-to-Action (CTA) elements must use the **Signature Gradient**:
- **From:** `primary-container` (#002446)
- **To:** A custom midpoint (#1a3a5f)
- **Direction:** 135-degree linear.
This adds a subtle, gem-like depth that signals "Premium Action."

---

## 3. Typography
The system relies on high-contrast pairings to evoke an editorial authority.

*   **Latin Characters (Inter):** Used for instructional text and UI labels. Use `letter-spacing: -0.02em` for headlines to achieve a tighter, bespoke look.
*   **Japanese Characters (Noto Sans JP):** Essential for learning content. Ensure `line-height` is increased by 15% compared to Latin text to account for the visual complexity of Kanji.

**Hierarchy Strategy:**
- **Display LG (3.5rem):** Use for lesson titles or "Word of the Day." These should feel cinematic.
- **Body LG (1rem):** Used for editorial-style explanations. 
- **Label SM (0.6875rem):** All-caps for metadata, using the `secondary` (#426087) color to recede visually.

---

## 4. Elevation & Depth
In a "No-Line" system, depth is the only way to communicate interaction.

### The Layering Principle
Never use a shadow where a color shift will suffice. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-high` (#e7e8ea) section to create a soft, natural lift.

### Ambient Shadows
For floating elements (Modals, FABs), use **Primary-Tinted Shadows**:
- **Blur:** 24px - 40px
- **Spread:** -4px
- **Opacity:** 6%
- **Color:** `#000e21` (Primary). 
This mimics natural light reflecting off a dark surface, avoiding the "dirty" look of grey shadows.

### Glassmorphism & Depth
For overlays and top-navigation bars, use a **Frosted Washi** effect:
- **Background:** `surface` (#f8f9fb) at 80% opacity.
- **Backdrop-blur:** 12px.
This allows the content to scroll underneath with a soft, blurred presence, maintaining a sense of place.

---

## 5. Components

### Buttons
- **Primary:** Features the Signature Gradient, `xl` (0.75rem) roundedness, and a subtle `surface-tint` shadow. No border.
- **Secondary:** `surface-container-highest` background with `on-surface` text. 
- **Tertiary:** Pure text with `primary` color and 700 weight. Use for low-priority actions like "Cancel."

### Editorial Cards
Cards must not have borders. Use `surface-container-lowest` (#ffffff) with a 4% primary-tinted shadow. Asymmetric padding (e.g., more padding at the bottom than the top) can give cards a custom, handcrafted feel.

### Input Fields
- **Resting:** `surface-container-high` background, `xl` roundedness, no border.
- **Focused:** The background shifts to `surface-container-lowest` (#ffffff) with a 2px `primary` bottom-only "calligraphy stroke" (the only exception to the No-Line rule).
- **Error:** Uses `error_container` (#ffdad6) background with `error` (#ba1a1a) helper text.

### Progress & Success
- **Success States:** Use `tertiary_fixed` (#8ef4e4) for soft backgrounds and `on_tertiary_container` (#2a9a8c) for text/icons. It should feel like a "calm win," not a loud celebration.

### Character Chips
For Japanese radicals or vocabulary, use `surface-container-low` with `md` (0.375rem) roundedness. Avoid the "pill" shape; the `md` rounding feels more like a cut stone.

---

## 6. Do's and Don'ts

### Do:
- **Do** use large amounts of white space (32px+) between sections.
- **Do** overlap elements (e.g., an image slightly breaking the bounds of its container) to create an editorial layout.
- **Do** use `primary_fixed` (#d3e3ff) for subtle highlights in educational text.

### Don't:
- **Don't** use 1px solid dividers. Use a 16px vertical gap or a tonal background shift.
- **Don't** use pure black (#000000) for text. Always use `on_surface` (#191c1e).
- **Don't** use "default" system animations. Use slow, easing-out transitions (300ms+) to maintain the "Zen" atmosphere.
- **Don't** crowd the interface. If a screen feels busy, remove elements rather than adding containers.