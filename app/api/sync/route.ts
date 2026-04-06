import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  cardSrs,
  dailyStats,
  userSettings,
  streakData,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { CardSRS, DailyStats, BenkyoSettings, StreakData } from "@/lib/types";

type SyncPayload = {
  srs?: Record<string, CardSRS>;
  dailyStats?: Record<string, DailyStats>;
  streak?: StreakData;
  settings?: BenkyoSettings;
};

function normalizeISODate(value: string): string {
  if (!value) return "";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function parseTimestamp(value: string): number {
  const ts = Date.parse(value);
  if (!Number.isNaN(ts)) return ts;

  const normalized = Date.parse(`${normalizeISODate(value)}T00:00:00.000Z`);
  return Number.isNaN(normalized) ? 0 : normalized;
}

function shouldReplaceCard(
  existing: typeof cardSrs.$inferSelect,
  incoming: CardSRS,
): boolean {
  const incomingTs = parseTimestamp(incoming.lastReview);
  const existingTs = parseTimestamp(existing.lastReview);
  if (incomingTs !== existingTs) return incomingTs > existingTs;

  if (incoming.totalReviews !== existing.totalReviews) {
    return incoming.totalReviews > existing.totalReviews;
  }
  if (incoming.totalCorrect !== existing.totalCorrect) {
    return incoming.totalCorrect > existing.totalCorrect;
  }
  if (incoming.repetitions !== existing.repetitions) {
    return incoming.repetitions > existing.repetitions;
  }
  if (incoming.interval !== existing.interval) {
    return incoming.interval > existing.interval;
  }
  if (incoming.dueDate !== existing.dueDate) {
    return incoming.dueDate > existing.dueDate;
  }

  return incoming.ease > existing.ease;
}

function shouldReplaceDailyStats(
  existing: typeof dailyStats.$inferSelect,
  incoming: DailyStats,
): boolean {
  if (incoming.reviewed !== existing.reviewed) {
    return incoming.reviewed > existing.reviewed;
  }
  if (incoming.correct !== existing.correct) {
    return incoming.correct > existing.correct;
  }
  return incoming.timeSpentSeconds > existing.timeSpentSeconds;
}

// GET /api/sync — download all user data to merge into localStorage
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const database = db();

  const [srsRows, statsRows, settingsRow, streakRow] = await Promise.all([
    database.select().from(cardSrs).where(eq(cardSrs.userId, userId)),
    database.select().from(dailyStats).where(eq(dailyStats.userId, userId)),
    database.select().from(userSettings).where(eq(userSettings.userId, userId)).get(),
    database.select().from(streakData).where(eq(streakData.userId, userId)).get(),
  ]);

  const srs: Record<string, CardSRS> = {};
  for (const row of srsRows) {
    srs[row.cardId] = {
      ease: row.ease,
      interval: row.interval,
      dueDate: row.dueDate,
      repetitions: row.repetitions,
      lastReview: row.lastReview,
      totalReviews: row.totalReviews,
      totalCorrect: row.totalCorrect,
    };
  }

  const stats: Record<string, DailyStats> = {};
  for (const row of statsRows) {
    stats[row.date] = {
      reviewed: row.reviewed,
      correct: row.correct,
      timeSpentSeconds: row.timeSpentSeconds,
    };
  }

  return NextResponse.json({
    srs,
    dailyStats: stats,
    streak: streakRow
      ? { current: streakRow.current, lastDate: streakRow.lastDate }
      : null,
    settings: settingsRow ? { dailyGoal: settingsRow.dailyGoal } : null,
  });
}

// POST /api/sync — upload localStorage data to the database (merge, last-write wins per card)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body: SyncPayload = await req.json();
  const database = db();

  // Sync SRS cards
  if (body.srs) {
    for (const [cardId, card] of Object.entries(body.srs)) {
      const existing = await database
        .select()
        .from(cardSrs)
        .where(and(eq(cardSrs.userId, userId), eq(cardSrs.cardId, cardId)))
        .get();

      if (!existing) {
        await database.insert(cardSrs).values({ userId, cardId, ...card });
      } else if (shouldReplaceCard(existing, card)) {
        await database
          .update(cardSrs)
          .set({ ...card, updatedAt: new Date() })
          .where(and(eq(cardSrs.userId, userId), eq(cardSrs.cardId, cardId)));
      }
    }
  }

  // Sync daily stats
  if (body.dailyStats) {
    for (const [date, stats] of Object.entries(body.dailyStats)) {
      const existing = await database
        .select()
        .from(dailyStats)
        .where(and(eq(dailyStats.userId, userId), eq(dailyStats.date, date)))
        .get();

      if (!existing) {
        await database.insert(dailyStats).values({ userId, date, ...stats });
      } else if (shouldReplaceDailyStats(existing, stats)) {
        await database
          .update(dailyStats)
          .set(stats)
          .where(and(eq(dailyStats.userId, userId), eq(dailyStats.date, date)));
      }
    }
  }

  // Sync streak
  if (body.streak) {
    const existing = await database
      .select()
      .from(streakData)
      .where(eq(streakData.userId, userId))
      .get();

    if (!existing) {
      await database.insert(streakData).values({ userId, ...body.streak });
    } else if (
      body.streak.lastDate > existing.lastDate ||
      (body.streak.lastDate === existing.lastDate && body.streak.current > existing.current)
    ) {
      await database
        .update(streakData)
        .set({ ...body.streak, updatedAt: new Date() })
        .where(eq(streakData.userId, userId));
    }
  }

  // Sync settings
  if (body.settings) {
    const existing = await database
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .get();

    if (!existing) {
      await database.insert(userSettings).values({ userId, ...body.settings });
    } else {
      await database
        .update(userSettings)
        .set({ ...body.settings, updatedAt: new Date() })
        .where(eq(userSettings.userId, userId));
    }
  }

  return NextResponse.json({ ok: true });
}
