# UX Improvements: Learning Experience

## What Works Well
- SM-2 spaced repetition with proper intervals, fuzz factor, 21-day mastery threshold
- 3 clear entry points on home (Kana, Lessons, Learning Path)
- Keyboard-driven sessions (number keys for ratings, Enter/Space to reveal)
- Session queue re-inserts wrong cards with `correctsNeeded + 2`
- Progress visibility: streak ring, daily goal ring, 7-day chart, due card count
- Pre-session config: mode, direction, card type filters

---

## Improvements

### Priority 1: High Impact, Low Effort

- [ ] **SRS rating interval preview** — Show next review date on each button (e.g., "Good — 3 days"). Users currently don't understand what Again/Hard/Good/Easy mean or how they affect scheduling.
  - Files: `components/session/deck-session-client.tsx` (lines 59-93), `lib/srs.ts`

- [ ] **Wrong answer explanation pause** — When a user gets an MC question wrong, it immediately rates "Again" and moves on. Add a 1-2 second pause showing the correct answer + card hint before advancing.
  - Files: `components/session/deck-session-client.tsx` (lines 326-335)

- [ ] **Session length guardrails** — Each wrong answer adds +2 to `correctsNeeded`, so sessions can snowball for struggling users. Cap `correctsNeeded` at 3, show estimated remaining cards, and offer a "Take a break" option after 10 min or 30 cards.
  - Files: `lib/session.ts`, `components/session/deck-session-client.tsx`

- [ ] **First-time onboarding** — New users land on "Okaeri, Scholar" with empty stats and no guidance. Add a welcome overlay explaining where to start and what SRS is. Store `hasSeenOnboarding` in localStorage.
  - Files: `components/home/home-client.tsx`, new onboarding component

### Priority 2: High Impact, Medium Effort

- [ ] **Audio playback** — No audio exists. Romaji alone can't teach pitch accent or mora timing. Start with browser `SpeechSynthesis` API (`ja-JP` voice) and a speaker icon on each card.
  - Files: new utility in `lib/`, integration in `components/session/deck-session-client.tsx`

- [ ] **Review queue prioritization** — Due cards are shuffled randomly. Sort by: most overdue first, then lowest accuracy, then earliest due. Show overdue count separately.
  - Files: `lib/srs.ts` (`getDueCards`), review session setup

### Priority 3: Medium Impact, Medium Effort

- [ ] **Smarter MC distractors** — Distractors are randomly pulled from the lesson pool and can be obviously wrong. Filter to same card type, similar difficulty, and semantically related words.
  - Files: `components/session/deck-session-client.tsx` (lines 257-283)

- [ ] **Learning path narrative** — Path nodes show titles but no context. Add brief descriptions ("Learn to introduce yourself") and outcome statements ("After this, you can order food").
  - Files: `components/path/learning-path-client.tsx`, `data/lessons.json`

### Priority 4: High Impact, High Effort (Content)

- [ ] **Example sentences on cards** — Vocab cards show word + translation in isolation. Add an `example` field to card data with a sentence using the word, shown after reveal.
  - Files: `data/lessons.json`, `lib/types.ts`, `components/session/deck-session-client.tsx`

### Priority 5: Low Impact, Medium Effort

- [ ] **Stats page simplification** — Charts everywhere but no actionable insight. Lead with a summary: "Focus on Lesson 3 — your accuracy dropped" and move detailed charts behind a toggle.
  - Files: `components/stats/` (stats page components)
