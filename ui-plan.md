# Plan: UI Design Migration - Fix Regressions & Restore Features

## Context

Branch `gabe` (commits `da832b0`, `323d8d1`) did a complete UI overhaul based on a Stitch design. The new design looks good but broke several features and introduced stub/placeholder content. We need to fix all regressions while keeping the new design. Work happens on `feature/design-update` branched from `gabe`.

Old implementations (pre-overhaul) are available via `git show main:<path>` and should be referenced to restore lost features with minimal new code.

## Guardrails

- Keep visual design language from `gabe`.
- Restore feature parity with `main` first; stylistic polish second.
- Avoid introducing new product scope (auth, real search, profiles) in this migration.

---

## Task 1: Restore Kana Typing Workflow (Dual Mode)

**Problem**: Kana went from typing practice to MC-only. Need both modes with a toggle.

**Files to modify**:

- `components/kana/kana-config-form.tsx` - Add mode selector (MC vs Typing)
- `app/kana/session/page.tsx` - Read `mode` from searchParams, pass through
- `components/kana/kana-session-renderer.tsx` - Pass `mode` prop
- `components/kana/kana-session-client.tsx` - Conditional render: MC UI (existing) or Typing UI (restore from main)

**Approach**:

1. Add `mode` state to config form with a segmented toggle styled like the existing hiragana/katakana toggle.
2. Append `&mode=${mode}` to session URL.
3. In session page, extract `mode` param, validate as `"mc" | "typing"`, default `"mc"`.
4. In `KanaSessionClient`:
   - Add `mode` prop.
   - For `mode === "typing"`: restore `processBatch()`, `activeCards = queue.slice(0, batchSize)`, use existing `TypingPracticeInput`, add answer key toggle (Tab).
   - For `mode === "mc"`: keep current MC implementation unchanged.
   - Batch size only applies to typing mode; MC always shows 1 card.
5. Remove `scaledCards` logic in page.tsx. Pass base `cards` only and let client handle batch behavior.

**Reference**: `git show main:components/kana/kana-session-client.tsx` for old typing flow.

**Existing component to reuse**: `components/session/typing-practice-input.tsx`.

---

## Task 2: Wire Shuffle End-to-End

**Problem**: Config form sends `shuffle` param in URL but session page never reads it.

**Files to modify**:

- `app/kana/session/page.tsx` - Extract `shuffle` param
- `components/kana/kana-session-renderer.tsx` - Add `shuffle` prop
- `components/kana/kana-session-client.tsx` - Accept `shuffle` prop, conditionally shuffle queue
- `lib/session.ts` - Add `buildQueueOrdered()` export

**Approach**:

1. In page.tsx: `const shuffleParam = firstParam(query.shuffle); const shouldShuffle = shuffleParam !== "false";`
2. Pass `shuffle={shouldShuffle}` through renderer to client.
3. Add to `lib/session.ts`:
   ```ts
   export function buildQueueOrdered(cards: Card[]): SessionCard[] {
     return cards.map((card) => ({ card, correctsNeeded: 1 }));
   }
   ```
4. In client: `useState(() => shuffle ? buildQueue(cards) : buildQueueOrdered(cards))`.

---

## Task 3: Reintroduce Review & Stats in Navigation (And Keep Kana Reachable On Desktop)

**Problem**: `/review` and `/stats` exist but are unreachable from active nav; desktop nav also lacks a direct Kana entry.

**Files to modify**:

- `components/shared/bottom-nav.tsx` - Add Review + Stats items (5 total)
- `components/shared/desktop-sidebar.tsx` - Replace Community/Profile stubs and add Kana link
- `components/shared/top-app-bar.tsx` - Add Review + Stats to drawer

**Approach**:

1. **bottom-nav.tsx**: Add Review and Stats items; keep 5-item fit (`min-w-[60px]`, `h-5 w-5` icons). Remove `items[1].icon` reassignment and inline final icon.
2. **desktop-sidebar.tsx**:
   - Add explicit `/kana` nav item.
   - Replace `href="#"` Community/Profile with `/review` and `/stats`.
   - Keep correct active-state logic per route.
3. **top-app-bar.tsx**: Add Review and Stats links in drawer menu.

---

## Task 4: Remove Forced Lesson Lock

**Problem**: `lesson-deck-grid.tsx` hardcodes `isLocked = index === 3`.

**File to modify**: `components/decks/lesson-deck-grid.tsx`

**Approach**:

1. Delete forced lock constant.
2. Always use `/decks/${lesson.id}` in lesson cards.
3. Remove lock-only styles and lock branch rendering.
4. Keep one unlocked card template for all lessons.

---

## Task 5: Replace Hardcoded Deck Links

**Problem**: Links to `"lesson-4"`, `"/decks/grammar-particles"` point to invalid routes.

**Files to modify**:

- `components/home/home-client.tsx`
- `components/decks/lesson-deck-grid.tsx`

**Approach**:

1. In `home-client.tsx`, make fallbacks route-safe:
   - ID fallback: `lessons[0]?.id` and if unavailable route to `/decks`.
   - Title fallback: `lessons[0]?.title ?? "Get Started"`.
2. Replace `"/decks/grammar-particles"` with dynamic valid lesson IDs or `/decks`.
3. Validate all `Link href` values resolve to existing routes.

---

## Task 6: Placeholder Shell Actions Policy

**Decision**: Keep placeholders, but avoid misleading interactivity.

**Files to modify**:

- `components/shared/desktop-header.tsx`
- `components/shared/top-app-bar.tsx`

**Approach**:

1. Keep placeholder UI visible.
2. Add non-functional labeling where needed (`Coming soon`, `aria-disabled`, tooltip/copy).
3. Do not leave dead buttons that look active but do nothing silently.

---

## Task 7: Session Sidebar - Real Data + Collapsible

**Problem**: Deck session sidebar uses hardcoded mock content.

**File to modify**: `components/session/deck-session-client.tsx`

**Approach**:

1. Compute related cards from same sub-deck and render up to 3 real items.
2. Replace hardcoded mnemonic copy with `current.card.hint` (conditional section).
3. Add collapsible state (`sidebarOpen`, default false).
4. Remove or disable non-functional speaker/audio buttons unless implemented.
5. Keep sidebar hidden on mobile via responsive classes.

---

## Task 8: Kana Tab Deep Links

**Problem**: `/kana?tab=hiragana` and `/kana?tab=katakana` don’t initialize script selection.

**Files to modify**:

- `app/kana/page.tsx` - Read `searchParams`, pass `tab`
- `components/kana/kana-config-form.tsx` - Accept `initialScript` prop

**Approach**:

1. Update `app/kana/page.tsx` to async server component receiving `searchParams`.
2. Parse `tab` to `"hiragana" | "katakana"`, default hiragana.
3. Pass `initialScript` to form and initialize script + selected rows accordingly.

---

## Task 9: Clean Dead Code And Warnings

**Files to modify**:

- `components/shared/top-nav.tsx` - Delete (unused)
- `components/shared/desktop-header.tsx` - Remove unused `Image` import
- `components/home/home-client.tsx` - Remove or wire all currently unused vars (`dueCount`, `todayReviewed`, `dailyGoal`, `quickStartTitle`, `quickStartMastery`)
- `components/kana/kana-config-form.tsx` - Remove unused `KanaEntry`, `batchOptions`
- `components/kana/kana-session-client.tsx` - Remove or wire unused `groups`, `batchSize`
- `components/session/deck-session-client.tsx` - Remove unused `typeIcons`, `reviewLabels` if not used

**Validation command**:

- Run `pnpm lint` and clear new warnings introduced by migration work.

---

## Task 10: Fix Main Landmark Semantics (Accessibility)

**Problem**: App layout now renders a global `<main>`, and `PageShell` still renders another `<main>`.

**Files to modify**:

- `components/shared/page-shell.tsx`

**Approach**:

1. Change `PageShell` root element from `<main>` to `<section>` (or `<div>`).
2. Keep visual styles unchanged.
3. Ensure one primary main landmark per page.

---

## Task 11: Static Metric Integrity (Avoid Misleading Numbers)

**Problem**: Some new UI cards show hardcoded percentages and metrics that can mislead users at launch.

**Files to review/modify**:

- `components/home/home-client.tsx`
- `components/decks/lesson-deck-grid.tsx`

**Approach**:

1. Either wire cards to real SRS-derived values, or
2. Mark sections as editorial/preview with non-quantitative copy.
3. Do not ship fake precision values (e.g., static 85%, 42%, 12.4 hours) without data source.

---

## Suggested Batch Execution (Lowest Risk -> Highest Risk)

### Batch 1 (Recommended One-Shot While Credits Are Limited)

Low-risk, high-confidence, mostly deterministic edits:

- Task 4: Remove forced lesson lock
- Task 5: Replace hardcoded invalid links
- Task 3: Restore nav reachability (Review/Stats + Kana desktop entry)
- Task 9: Dead code cleanup + `pnpm lint`
- Task 10: Main landmark semantic fix

### Batch 2

Light plumbing changes with small behavior impact:

- Task 2: Shuffle end-to-end
- Task 8: Kana tab deep links

### Batch 3

Largest behavior restoration and highest integration risk:

- Task 1: Kana dual mode (Typing + MC)

### Batch 4

Moderate complexity, isolated to one area:

- Task 7: Session sidebar real-data refactor + collapsible

### Batch 5 (Optional but recommended before launch)

Data trust and product clarity polish:

- Task 11: Static metric integrity pass
- Task 6: Placeholder shell action labeling polish

---

## Verification

1. `pnpm build` - Ensure production build passes
2. `pnpm lint` - No errors; warnings only if explicitly accepted
3. Manual testing:
   - Navigate to Review and Stats from mobile and desktop nav
   - Confirm desktop has direct Kana entry
   - Start Kana in MC mode
   - Start Kana in Typing mode with batch sizes 1-4
   - Toggle shuffle off and verify stable order
   - Open `/kana?tab=katakana` and verify preselection
   - Verify all lesson cards are clickable (no forced lock)
   - Verify home/deck links route to valid pages
   - Open a deck session and confirm sidebar uses real related cards + collapse behavior
