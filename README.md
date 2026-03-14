# Benkyo

Benkyo is a personal Japanese study app built with Next.js App Router and TypeScript.
It focuses on fast, local practice with no accounts and no backend database.

## Features

- Lesson deck study from local JSON data
- Three deck modes:
  - Flashcard with manual reveal and self-grading
  - Multiple choice with randomized options
  - Typing mode with character-by-character validation
- Session queue logic:
  - Correct answer reduces required repetitions
  - Wrong answer adds extra required repetitions and requeues the card
- Session results page showing cards missed at least once
- Kana trainer:
  - Hiragana and Katakana
  - Group selection: Basic, Dakuten, Combo
  - Row-level customization per group
  - Batch mode (1 to 4 kana at once)
  - Answer key modal during practice

## How To Use

### Deck Study

1. Open the home page.
2. Go to Lesson decks.
3. Select a lesson.
4. Choose study mode and direction.
5. Start session.
6. Complete cards until the queue is cleared.
7. Review missed cards in the results screen.

### Kana Practice

1. Open Kana practice.
2. Choose script (hiragana or katakana).
3. Choose batch size (1 to 4).
4. Select groups and optionally customize by row.
5. Start kana session.
6. Type romaji for displayed kana.
7. Use Answer key or Skip when needed.

## Content Editing

Lesson content lives in `data/lessons.json`.

For best typing behavior in deck typing mode, each card can include:

- `front`: Japanese text
- `back`: English meaning
- `romaji`: Romanized reading (optional but recommended)

If `romaji` is missing, typing mode falls back to `back`.

## Notes

- This app is intentionally local-first and simple.
- Session result data is stored in browser `sessionStorage`.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- pnpm

## Project Structure

```text
app/
	page.tsx                          Home
	decks/page.tsx                    Deck list
	decks/[lessonId]/page.tsx         Deck setup
	decks/[lessonId]/session/page.tsx Deck session
	decks/[lessonId]/session/results  Deck results
	kana/page.tsx                     Kana setup
	kana/session/page.tsx             Kana session
components/
	session/                          Deck session UI
	kana/                             Kana setup/session UI
	results/                          Deck result UI
	shared/                           Shell and navigation
data/
	lessons.json                      Study content
lib/
	session.ts                        Queue algorithm
	kana.ts                           Kana datasets and row helpers
	types.ts                          Shared types
```

## How To Run

1. Install dependencies:

```bash
pnpm install
```

2. Start dev server:

```bash
pnpm dev
```

3. Open:

```text
http://localhost:3000
```

## Validation Commands

Use these to verify the app before pushing changes:

```bash
pnpm build
pnpm lint
pnpm tsc --noEmit
```