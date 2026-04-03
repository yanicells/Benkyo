# Landing Page Task Backlog

This file is a plain-language backlog (not an implementation plan).
Use it as source material for future planning.

## Scope

- Landing pages first: Home, Decks, Kana, Review, Stats
- Focus areas: mock data removal, font consistency, general UX quality

## A) Mock Data And Placeholder Cleanup

### Home page

- [ ] Bring back the real Home status widgets from main: streak count, due-card count, and daily-goal progress ring.
- [ ] Add a due-card badge/indicator on the Home review entry card (same behavior as main: show count when due > 0).
- [ ] Replace the "Daily Kanji" hero content with real data (current due card, next review card, or a selected study focus), not fixed copy.
- [ ] Replace static On-Yomi and Kun-Yomi values with values from the selected card.
- [ ] Replace the hardcoded weekly streak bars with real 7-day review activity.
- [ ] Replace static "15 MIN SESSION" and "20 MIN SESSION" labels with computed estimates or remove duration labels until real data is available.
- [ ] Replace the static bottom stats row values (focus time, mastered count, level text) with real values or hide cards with a "not enough data yet" state.
- [ ] Remove or relabel purely decorative labels that imply real personalization (example: "FOUNDATION", "GRAMMAR") if they are not data-driven.

### Decks page

- [ ] Replace static Hiragana and Katakana progress values (percentages and bars) with real progress data.
- [ ] Replace static Kanji mastery values (global percent and N-level bars) with real progression data or an explicit preview state.
- [ ] Replace static Grammar progress values with real lesson-based progress.
- [ ] Remove or replace decorative recommendation badges that imply ranking logic (example: "RECOMMENDED FOR YOU") unless recommendation logic exists.
- [ ] Replace externally hosted decorative images with local assets or data-driven visuals to avoid third-party dependency and style drift.

### Kana page

- [ ] Add a data preview before session start (estimated card count and expected duration from selected rows) so users understand what will be studied.
- [ ] Ensure labels and descriptions are factual and tied to the selected script/groups, not fixed editorial wording.

### Review and Stats pages

- [ ] Keep using real SRS data, but add stronger "no data yet" states so empty/new users do not see confusing blanks.
- [ ] Audit all summary labels to ensure every number shown has a clear source and update path.

## B) Font Consistency And Typography Rules

### Baseline font rules

- [ ] Document and enforce one typography rule set across landing pages.
- [ ] Body copy uses body font.
- [ ] Latin headings and numeric emphasis use display font.
- [ ] Japanese glyph-focused text uses japanese display font.

### Current cleanup targets

- [ ] Home header currently styles an English word with japanese display styling; align this with the typography system.
- [ ] Kana setup page uses display font for kana glyph samples; switch kana glyph UI to japanese display for consistency.
- [ ] Deck cards that show Japanese decorative strings should use japanese display where appropriate.
- [ ] Remove conflicting font utility combinations (example: simultaneous font-light and font-normal on same element).

## C) General UX Improvements

- [ ] Clarify CTA intent on Home (example: a label implying stroke-order viewing should not route somewhere unrelated).
- [ ] Remove fake interactivity: icon buttons or action affordances that do not do anything should be disabled, hidden, or labeled as "coming soon".
- [ ] Reduce first-load visual jumps on landing pages (show skeleton/loading state instead of showing temporary default numbers and then swapping).
- [ ] Improve information hierarchy on Home and Decks so the primary action is obvious within 3 seconds.
- [ ] Add a lesson pre-study landing step ("Read this first") before session start, with main notes and a concise cheat sheet so learners know what to focus on.
- [ ] Include an optional embedded YouTube lesson guide on the lesson landing page for learners who want a quick walkthrough before drills.
- [ ] Ensure all major cards have clear primary actions and consistent click behavior (whole-card click vs button click should not conflict).
- [ ] Review mobile spacing and tap targets to keep controls comfortable on small screens.
- [ ] Add/verify accessible labels for icon-only controls and maintain visible keyboard focus styles.

## D) Functionality Improvements / Features

- [ ] Add a progress graph powered by Mayumi cards data (daily activity, accuracy trend, and mastery trend).
- [ ] Improve the study algorithm (Anki SM-2, better scheduling, lapse handling, and difficulty progression).
- [ ] Add accounts + database so progress syncs across devices and sessions.
- [ ] Improve learning flow with a guided path (Duolingo-style ladder: start here, then next lesson, then next milestone).
- [ ] Add lesson content metadata in data source (summary notes, cheat-sheet bullets, recommended YouTube URL, and guidance order) so the pre-study page is data-driven instead of hardcoded.
- [ ] Ensure strong mobile responsiveness and complete PWA behavior (installability, offline handling, and stable mobile navigation).

## Suggested Order (for future planning)

- [ ] Pass 1: Remove misleading mock numbers and fake recommendation signals.
- [ ] Pass 2: Typography cleanup and consistency pass.
- [ ] Pass 3: CTA clarity, loading states, and interaction polish.
- [ ] Pass 4: Landing-page visual refinement after data is fully real.
- [ ] Pass 5: Functionality upgrades (graph, algorithm, accounts/db, guided ladder, PWA hardening).
