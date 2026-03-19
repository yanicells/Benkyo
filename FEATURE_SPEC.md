# Benkyou - Japanese Study App Feature Spec v2.0

## Overview
Comprehensive upgrade of the Benkyou Japanese study app. This spec covers: new data schema, deprecated features, new study modes, persistent SRS, progress analytics, and navigation restructure.

---

## 1. Data Schema Changes

### New `lessons.json` structure
The JSON has been restructured from a flat deck list to a nested lesson > sub-deck hierarchy.

**Before (v1):**
```json
{
  "lessons": [
    { "id": "greetings", "title": "Greetings", "cards": [...] }
  ]
}
```

**After (v2):**
```json
{
  "version": "2.0",
  "schema": { "types": { "vocab": "...", "grammar": "...", "fill-in": "...", "conjugation": "...", "translate": "...", "culture": "..." } },
  "lessons": [
    {
      "id": "lesson-1",
      "title": "Lesson 1: New Friends",
      "subDecks": [
        {
          "id": "lesson-1-vocab",
          "title": "L1: Vocabulary",
          "cards": [...]
        }
      ]
    }
  ]
}
```

### Card types and fields
Every card now has a `type` field. Optional fields depend on type:

| Type | Required Fields | Optional Fields | Description |
|------|----------------|-----------------|-------------|
| `vocab` | front, back, romaji | hint | Standard vocabulary flashcard |
| `grammar` | front, back | romaji | Grammar pattern explanation |
| `fill-in` | front (with blank), back | hint, romaji | Sentence with a gap to fill |
| `conjugation` | front (base + target), back | romaji | Conjugation drill |
| `translate` | front (source sentence), back (target sentence) | romaji | Full sentence translation |
| `culture` | front (topic), back (explanation) | romaji | Culture note |

### Migration notes
- All existing card data is preserved in the new structure
- Old flat `lessons[].cards` is now `lessons[].subDecks[].cards`
- The `id` field on sub-decks follows the pattern `{lesson-id}-{type}`
- Routes need updating: `/decks/[lessonId]` becomes `/decks/[lessonId]` (lesson overview) with a new `/decks/[lessonId]/[subDeckId]` (sub-deck detail)

---

## 2. Deprecated Features

### Remove: Typing study mode
- Remove the "Typing" option from the session config screen
- Remove all typing-mode related code and UI
- Only two study modes remain: **Flashcard** and **Multiple Choice**
- The fill-in-the-blank card type is handled via Multiple Choice mode (generate wrong answers from same deck) and Flashcard mode (show blank, flip to reveal)

---

## 3. Navigation Restructure

### New route hierarchy
```
/                           Home (landing page)
/decks                      Lesson list (8 lessons displayed as cards)
/decks/[lessonId]           Sub-deck list for a lesson (e.g., vocab, grammar, kanji)
/decks/[lessonId]/[subDeckId]           Sub-deck config (choose mode + direction)
/decks/[lessonId]/[subDeckId]/session   Active study session
/decks/[lessonId]/[subDeckId]/session/results   Results screen
/review                     Cross-deck "Review All Due" (SRS-based)
/kana                       Kana practice (unchanged)
/kana/session               Kana session (unchanged)
/stats                      Progress dashboard
```

### Lesson list page (`/decks`)
- Display lessons as cards in a grid
- Each card shows: lesson title, number of sub-decks, total cards, and a small progress indicator (% mastered based on SRS data)
- Clicking a lesson card navigates to the sub-deck list

### Sub-deck list page (`/decks/[lessonId]`)
- Show all sub-decks for that lesson as smaller cards
- Each sub-deck card shows: title, card count, deck type icon (vocab/grammar/kanji/etc), and mastery %
- "Study All" button at top to start a combined session of all sub-decks in the lesson
- Back button returns to `/decks`

### Home page updates
- Keep existing cards for Decks and Kana
- Add a "Review Due Cards" card that shows the count of due cards across all decks
- Add a "Daily Streak" counter
- Remove keyboard shortcut reference from home (move to a help modal or settings)

---

## 4. New Study Mode: Fill-in-the-Blank

### How it works
- Only available for cards with `type: "fill-in"`
- When a deck contains fill-in cards: show them in both Flashcard and MC modes
- **Flashcard mode**: Show the sentence with the blank. User thinks of the answer, then flips to reveal.
- **Multiple Choice mode**: Show the sentence with the blank. Generate 3 wrong options from other cards in the same deck (same field type). User selects the correct answer.

### Generating wrong answers for MC
For fill-in cards, pull `back` values from other fill-in cards in the same sub-deck as distractors. If the sub-deck has fewer than 3 other fill-in cards, pull from other sub-decks in the same lesson. Ensure distractors are plausible (same card type, similar length).

For vocab/conjugation MC, pull from the same sub-deck first, then same lesson.

---

## 5. Persistent SRS (Anki-style)

### Storage
- Use `localStorage` for all SRS data
- Key: `benkyou-srs-data`
- Value: JSON object keyed by card ID (constructed as `{subDeckId}:{cardIndex}`)

### Card SRS state
```typescript
interface CardSRS {
  ease: number;          // Ease factor (default 2.5, min 1.3)
  interval: number;      // Current interval in days
  dueDate: string;       // ISO date string
  repetitions: number;   // Consecutive correct answers
  lastReview: string;    // ISO date string
  totalReviews: number;  // Lifetime review count
  totalCorrect: number;  // Lifetime correct count
}
```

### Algorithm (simplified SM-2)
On review, user rates: **Again** (0), **Hard** (1), **Good** (2), **Easy** (3)

```
if rating < 2 (Again/Hard):
  repetitions = 0
  interval = 1
  ease = max(1.3, ease - 0.2)
else:
  if repetitions == 0: interval = 1
  elif repetitions == 1: interval = 3
  else: interval = round(interval * ease)
  
  if rating == 2 (Good): ease = ease (no change)
  if rating == 3 (Easy): ease = ease + 0.15, interval *= 1.3
  
  repetitions += 1

dueDate = today + interval days
```

### Session integration
- **During session**: After answering, show Again/Hard/Good/Easy buttons instead of just Correct/Wrong
- **Flashcard mode**: After flipping, user self-rates with the 4 buttons
- **MC mode**: Wrong answer = Again. Correct answer = show Good/Easy choice

### "Review All Due" (`/review`)
- Pulls all cards where `dueDate <= today` across every sub-deck
- Shuffles them into a single session
- Shows source deck label on each card
- Session config: choose Flashcard or MC mode, direction
- Home page shows badge with due card count

### Export/Import
- Settings page (or modal) with "Export Progress" button: downloads `benkyou-srs-data` as `.json` file
- "Import Progress" button: file picker, reads JSON, merges into localStorage (newer timestamps win)
- "Reset Progress" button with confirmation dialog

---

## 6. Progress Dashboard (`/stats`)

### Overview section
- Total cards studied (lifetime)
- Current daily streak (days in a row with at least 1 review)
- Cards mastered (interval >= 21 days)
- Cards due today
- Average accuracy (totalCorrect / totalReviews across all cards)

### Per-lesson breakdown
- Expandable accordion for each lesson
- Shows: sub-deck name, total cards, mastered count, accuracy %, weakest cards (lowest accuracy)

### Accuracy trend chart
- Line chart showing daily accuracy over the last 30 days
- Store daily stats in localStorage key `benkyou-daily-stats`:
```typescript
interface DailyStats {
  [dateISO: string]: {
    reviewed: number;
    correct: number;
    timeSpentSeconds: number;
  }
}
```

### Weak cards list
- Show the 10 cards with the lowest accuracy (totalCorrect/totalReviews)
- Each shows: card front (truncated), deck name, accuracy %, last review date
- "Drill Weak Cards" button to start a session with just these cards

### Daily streak
- Tracked via `benkyou-daily-stats`
- A day counts if `reviewed >= 1`
- Display on home page and stats page
- Streak resets if a day is missed

---

## 7. Daily Goal

### Configuration
- On first launch (or in settings), prompt user to set a daily goal (number of cards to review)
- Default: 20 cards
- Options: 10, 20, 30, 50, custom

### Home page display
- Circular progress indicator showing cards reviewed today vs. daily goal
- "X / Y cards today" text
- Turns green/shows checkmark when goal is met

---

## 8. UI/UX Notes

### Card type indicators
- Show a small badge/icon on each card during session to indicate type:
  - Vocab: 語 or book icon
  - Grammar: 文 or lightbulb icon
  - Fill-in: pencil icon
  - Conjugation: 変 or arrows icon
  - Translate: 訳 or translate icon
  - Culture: 文化 or globe icon

### Session config screen updates
- Study mode: Flashcard | Multiple Choice (typing removed)
- Direction: Japanese → English | English → Japanese
- Card types filter: checkboxes to include/exclude types (all on by default)

### Keyboard shortcuts (session)
- Enter: flip card / confirm answer
- 1/2/3/4: select MC option OR rate Again/Hard/Good/Easy
- Tab: show answer key
- Space: flip card (alias for Enter)

### Responsive design
- All new pages must work on mobile (the app is a PWA)
- Sub-deck grid: 2 columns on mobile, 3 on tablet, 4 on desktop
- Stats charts should be touch-friendly

---

## 9. Technical Implementation Notes

### localStorage keys
| Key | Type | Purpose |
|-----|------|---------|
| `benkyou-srs-data` | `Record<string, CardSRS>` | Per-card SRS state |
| `benkyou-daily-stats` | `Record<string, DailyStats>` | Daily review stats |
| `benkyou-settings` | `{ dailyGoal: number, theme: string }` | User settings |
| `benkyou-streak` | `{ current: number, lastDate: string }` | Streak tracking |

### Data loading
- `lessons.json` is still a static file in the public directory
- On app load, parse the JSON and build a flat card index for SRS lookups
- Card IDs: `{subDeckId}:{index}` (e.g., `lesson-1-vocab:3`)

### Performance
- Lazy load sub-deck cards (only parse when entering a sub-deck)
- SRS calculations happen client-side, no heavy computation
- Dashboard charts: use a lightweight library (recharts is already available if using React artifacts)

---

## 10. File Deliverables

1. **`lessons.json`** - New comprehensive lesson data (509 cards, 30 sub-decks, 8 lessons)
2. **This spec** (`FEATURE_SPEC.md`) - Full feature specification
3. **`PROMPT.md`** - Implementation prompt for Claude Code

---

## Card Count Summary

| Lesson | Sub-decks | Cards |
|--------|-----------|-------|
| Writing System | 3 | 22 |
| Greetings & Expressions | 3 | 30 |
| Numbers | 2 | 34 |
| Lesson 1: New Friends | 3 | 62 |
| Lesson 2: Shopping | 2 | 69 |
| Lesson 3: Making a Date | 5 | 108 |
| Lesson 4: The First Date | 5 | 96 |
| Lesson 5: A Trip to Okinawa | 6 | 88 |
| **Total** | **30** | **509** |