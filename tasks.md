# Landing Page Task Backlog

This file is a plain-language backlog (not an implementation plan).
Use it as source material for future planning.

## Scope

- Landing pages first: Home, Decks, Kana, Review, Stats
- Focus areas: mock data removal, font consistency, general UX quality

## A) Mock Data And Placeholder Cleanup

### Home page

- [x] Bring back the real Home status widgets from main: streak count, due-card count, and daily-goal progress ring.
- [x] Add a due-card badge/indicator on the Home review entry card (same behavior as main: show count when due > 0).
- [x] Replace the "Daily Kanji" hero content with real data (current due card, next review card, or a selected study focus), not fixed copy.
- [x] Replace static On-Yomi and Kun-Yomi values with values from the selected card.
- [x] Replace the hardcoded weekly streak bars with real 7-day review activity.

### Decks page

- [x] Replace static Hiragana and Katakana progress values (percentages and bars) with real progress data.
- [x] Replace static Kanji mastery values (global percent and N-level bars) with real progression data or an explicit preview state.
- [x] Replace static Grammar progress values with real lesson-based progress.
- [x] Remove or replace decorative recommendation badges that imply ranking logic (example: "RECOMMENDED FOR YOU") unless recommendation logic exists.
- [x] Replace externally hosted decorative images with local assets or data-driven visuals to avoid third-party dependency and style drift.

### Kana page

- [x] Add a data preview before session start (estimated card count and expected duration from selected rows) so users understand what will be studied.
- [x] Ensure labels and descriptions are factual and tied to the selected script/groups, not fixed editorial wording.

### Review and Stats pages

- [x] Keep using real SRS data, but add stronger "no data yet" states so empty/new users do not see confusing blanks.
- [x] Audit all summary labels to ensure every number shown has a clear source and update path.

## B) Font Consistency And Typography Rules

### Current cleanup targets

- [x] Home header currently styles an English word with japanese display styling; align this with the typography system.

## C) General UX Improvements

- [x] Clarify CTA intent on Home (example: a label implying stroke-order viewing should not route somewhere unrelated).
- [x] Remove fake interactivity: icon buttons or action affordances that do not do anything should be disabled, hidden, or labeled as "coming soon".
- [x] Reduce first-load visual jumps on landing pages (show skeleton/loading state instead of showing temporary default numbers and then swapping).
- [x] Improve information hierarchy on Home and Decks so the primary action is obvious within 3 seconds.
- [x] Add a lesson pre-study landing step ("Read this first") before session start, with main notes and a concise cheat sheet so learners know what to focus on.
- [x] Include an optional embedded YouTube lesson guide on the lesson landing page for learners who want a quick walkthrough before drills.
- [x] Ensure all major cards have clear primary actions and consistent click behavior (whole-card click vs button click should not conflict).
- [x] Review mobile spacing and tap targets to keep controls comfortable on small screens.
- [x] Add/verify accessible labels for icon-only controls and maintain visible keyboard focus styles.

## D) Functionality Improvements / Features

IMPORTANT: Please refer to the latest commit on the main brach since most of these things have already been somewhat implemented in the main branch, main issue is that when we migrated to a new design, there are features not properly implemented.

- [ ] Add a progress graph (daily activity, accuracy trend, and mastery trend).
- [ ] Improve the study algorithm (Anki SM-2, better scheduling, lapse handling, and difficulty progression). Essentially just double check and ensure proper implementation.
- [ ] Add accounts + database so progress syncs across devices and sessions. Use Turso with SQLite, make own implementation of Auth, Google Auth is for future implementation. Main thing to store is just the Auth data, and the data for their profile, and what we are currently storing in local storage. Use drizzle.
- [ ] Improve learning flow with a guided path (Duolingo-style ladder: start here, then next lesson, then next milestone).
- [ ] Add lesson content metadata in data source (summary notes, cheat-sheet bullets, recommended YouTube URL, and guidance order) so the pre-study page is data-driven instead of hardcoded. Currently somewhat implemented, just need more improvements for both UI and content.
- [ ] Ensure strong mobile responsiveness and complete PWA behavior (installability, offline handling, and stable mobile navigation).
