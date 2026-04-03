# Plan: UI Design Migration - Fix Regressions & Restore Features

## Context
Branch `gabe` (commits `da832b0`, `323d8d1`) did a complete UI overhaul based on a Stitch design. The new design looks good but broke several features and introduced stub/placeholder content. We need to fix all regressions while keeping the new design. Work happens on `feature/design-update` branched from `gabe`.

Old implementations (pre-overhaul) are available via `git show main:<path>` and should be referenced to restore lost features with minimal new code.

---

## Task 1: Restore Kana Typing Workflow (Dual Mode)

**Problem**: Kana went from typing practice to MC-only. Need both modes with a toggle.

**Files to modify**:
- `components/kana/kana-config-form.tsx` - Add mode selector (MC vs Typing)
- `app/kana/session/page.tsx` - Read `mode` from searchParams, pass through
- `components/kana/kana-session-renderer.tsx` - Pass `mode` prop
- `components/kana/kana-session-client.tsx` - Conditional render: MC UI (existing) or Typing UI (restore from main)

**Approach**:
1. Add `mode` state to config form with a segmented toggle styled like the existing hiragana/katakana toggle
2. Append `&mode=${mode}` to session URL (line 77 of config form)
3. In session page, extract `mode` param, validate as `"mc" | "typing"`, default `"mc"`
4. In `KanaSessionClient`:
   - Add `mode` prop
   - For `mode === "typing"`: restore `processBatch()`, `activeCards = queue.slice(0, batchSize)`, use existing `TypingPracticeInput` component, add answer key toggle (Tab)
   - For `mode === "mc"`: keep current MC implementation unchanged
   - Batch size only applies to typing mode; MC always shows 1 card
5. Remove the `scaledCards` logic in page.tsx (line 65-67) - just pass `cards` directly; let the client handle batching

**Reference**: `git show main:components/kana/kana-session-client.tsx` for the old typing flow (processBatch, activeCards, TypingPracticeInput usage)

**Existing component to reuse**: `components/session/typing-practice-input.tsx` (still in codebase)

---

## Task 2: Wire Shuffle End-to-End

**Problem**: Config form sends `shuffle` param in URL but session page never reads it.

**Files to modify**:
- `app/kana/session/page.tsx` - Extract `shuffle` param
- `components/kana/kana-session-renderer.tsx` - Add `shuffle` prop
- `components/kana/kana-session-client.tsx` - Accept `shuffle` prop, conditionally shuffle queue
- `lib/session.ts` - Add `buildQueueOrdered()` export

**Approach**:
1. In page.tsx after line 31: `const shuffleParam = firstParam(query.shuffle);` then `const shouldShuffle = shuffleParam !== "false";`
2. Pass `shuffle={shouldShuffle}` through renderer to client
3. Add to `lib/session.ts`:
   ```ts
   export function buildQueueOrdered(cards: Card[]): SessionCard[] {
     return cards.map((card) => ({ card, correctsNeeded: 1 }));
   }
   ```
4. In client: `useState(() => shuffle ? buildQueue(cards) : buildQueueOrdered(cards))`

---

## Task 3: Reintroduce Review & Stats in Navigation

**Problem**: `/review` and `/stats` routes exist and are fully implemented but unreachable from nav.

**Files to modify**:
- `components/shared/bottom-nav.tsx` - Add Review + Stats items (5 total)
- `components/shared/desktop-sidebar.tsx` - Replace Community/Profile stubs with Review + Stats
- `components/shared/top-app-bar.tsx` - Add Review + Stats to drawer

**Approach**:
1. **bottom-nav.tsx**: Add Review (clock/refresh icon) and Stats (bar-chart icon) to items array. Reduce `min-w-[72px]` to `min-w-[60px]` and icon size from `h-6 w-6` to `h-5 w-5` for 5-item fit. Clean up the awkward `items[1].icon` reassignment at line 47 - inline the correct icon.
2. **desktop-sidebar.tsx**: Replace `href="#"` Community link (lines 40-48) with `/review` link. Replace `href="#"` Profile link (lines 50-58) with `/stats` link. Add active state styling matching existing pattern. Keep Community/Profile concept for future - these are just being replaced, not preserved.
3. **top-app-bar.tsx**: Add Review and Stats `<Link>` entries in the drawer menu section.
4. Use appropriate icons: Review = refresh/clock, Stats = bar-chart/trending-up

---

## Task 4: Remove Forced Lesson Lock

**Problem**: `lesson-deck-grid.tsx` line 29 hardcodes `isLocked = index === 3`.

**File to modify**: `components/decks/lesson-deck-grid.tsx`

**Approach**:
1. Delete `const isLocked = index === 3;` (line 29)
2. Remove ternary in Link href: always use `/decks/${lesson.id}`
3. Remove `pointer-events-none cursor-default` conditional class
4. Remove entire locked state rendering block (the else branch with grey overlay, lock icon, "Complete previous lessons" message)
5. `LessonCard` always renders the unlocked view

---

## Task 5: Replace Hardcoded Deck Links

**Problem**: Links to `"lesson-4"`, `"/decks/grammar-particles"` point to non-existent IDs.

**Files to modify**:
- `components/home/home-client.tsx` - Fix fallback IDs
- `components/decks/lesson-deck-grid.tsx` - Fix hardcoded grammar-particles link

**Approach**:
1. In `home-client.tsx`: Replace `?? "lesson-4"` fallback with `?? lessons[0]?.id ?? ""`. Replace `?? "Genki I: Unit 4"` with `?? lessons[0]?.title ?? "Get Started"`.
2. Replace `/decks/grammar-particles` reference in home-client.tsx with dynamic link using `lessons[1]?.id` or just `/decks`.
3. In `lesson-deck-grid.tsx` line 220: Replace `/decks/grammar-particles` with `/decks` or a dynamic lesson reference.

---

## Task 6: Keep Placeholder Shell Actions

No changes. Search, settings, community/profile in desktop-header, and "Start Daily Session" button remain as-is.

---

## Task 7: Session Sidebar - Real Data + Collapsible

**Problem**: Deck session sidebar (lines ~430-500 of `deck-session-client.tsx`) shows hardcoded mock data.

**File to modify**: `components/session/deck-session-client.tsx`

**Approach**:
1. Compute related cards from same sub-deck:
   ```ts
   const relatedCards = useMemo(() => {
     const currentSdId = cardSubDeckIds[currentOriginalIndex];
     return cards
       .filter((c, i) => cardSubDeckIds[i] === currentSdId && i !== currentOriginalIndex)
       .slice(0, 3);
   }, [current, ...]);
   ```
2. Replace mock "Linked Vocabulary" entries with `relatedCards.map(...)` showing real `front` / `back` values
3. Replace hardcoded mnemonic text with `current.card.hint` (show panel only when hint exists)
4. Add collapsible state: `const [sidebarOpen, setSidebarOpen] = useState(false)` (hidden by default)
5. Add toggle button (chevron) at top of sidebar panel
6. On mobile, sidebar should be fully hidden (existing responsive layout likely handles this)

---

## Task 8: Kana Tab Deep Links

**Problem**: `/kana?tab=hiragana` and `/kana?tab=katakana` links don't set initial script state.

**Files to modify**:
- `app/kana/page.tsx` - Read `searchParams`, pass `tab` to form
- `components/kana/kana-config-form.tsx` - Accept `initialScript` prop

**Approach**:
1. In `app/kana/page.tsx`:
   ```tsx
   type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
   export default async function KanaPage({ searchParams }: Props) {
     const query = await searchParams;
     const tab = query.tab === "katakana" ? "katakana" : "hiragana";
     return <PageShell ...><KanaConfigForm initialScript={tab} /></PageShell>;
   }
   ```
2. In config form: Add `initialScript?: KanaScript` prop, use as default for `script` state and `selectedRows` initialization.

---

## Task 9: Clean Dead Code

**Files to modify**:
- `components/shared/top-nav.tsx` - Delete entirely (unused, never imported in layout)
- `components/shared/desktop-header.tsx` - Remove unused `import Image from "next/image"`
- `components/home/home-client.tsx` - Remove unused `todayReviewed`, `dailyGoal` state/variables and related imports if orphaned
- Run `npx next lint` and fix remaining warnings

---

## Implementation Order

1. Task 4 (Remove lesson lock) - 5 min, simple deletion
2. Task 5 (Fix hardcoded links) - 10 min, string replacements
3. Task 2 (Wire shuffle) - 15 min, small pipeline change
4. Task 8 (Kana deep links) - 10 min, small 2-file change
5. Task 3 (Nav routes) - 20 min, 3 nav components
6. Task 1 (Kana typing mode) - 45 min, largest change, depends on Task 2
7. Task 7 (Session sidebar) - 30 min, isolated to one file
8. Task 9 (Dead code cleanup) - 15 min, final sweep + lint

---

## Verification

1. `npm run build` - Ensure production build passes
2. `npx next lint` - Zero errors, minimal warnings
3. Manual testing:
   - Navigate to Review and Stats from both mobile and desktop nav
   - Start a kana session in MC mode - verify it works as before
   - Start a kana session in Typing mode - verify typing flow with batch sizes 1-4
   - Toggle shuffle off, verify cards appear in order
   - Click `/kana?tab=katakana` deep link, verify katakana is pre-selected
   - Verify all lesson cards are clickable (no locks)
   - Verify home page links go to valid lessons
   - Open a deck session, verify sidebar shows real related cards and can be collapsed
