import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertStockCache, users, watchlist, portfolio, stockCache, priceHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStockByTicker(ticker: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stockCache).where(eq(stockCache.ticker, ticker.toUpperCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserWatchlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(watchlist).where(eq(watchlist.userId, userId));
}

export async function addToWatchlist(userId: number, ticker: string, companyName?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(watchlist).values({
    userId,
    ticker: ticker.toUpperCase(),
    companyName,
  });
}

export async function removeFromWatchlist(userId: number, ticker: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(watchlist).where(
    and(eq(watchlist.userId, userId), eq(watchlist.ticker, ticker.toUpperCase()))
  );
}

export async function getUserPortfolio(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolio).where(eq(portfolio.userId, userId));
}

export async function addToPortfolio(userId: number, ticker: string, shares: number, averageCost: number, companyName?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(portfolio).values({
    userId,
    ticker: ticker.toUpperCase(),
    shares,
    averageCost,
    companyName,
  });
}

export async function updatePortfolioHolding(portfolioId: number, shares: number, averageCost: number, currentPrice?: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(portfolio).set({
    shares,
    averageCost,
    currentPrice,
  }).where(eq(portfolio.id, portfolioId));
}

export async function removeFromPortfolio(portfolioId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(portfolio).where(eq(portfolio.id, portfolioId));
}

export async function updateStockCache(ticker: string, data: Partial<InsertStockCache>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getStockByTicker(ticker);
  if (existing) {
    await db.update(stockCache).set(data).where(eq(stockCache.ticker, ticker.toUpperCase()));
  } else {
    await db.insert(stockCache).values({
      ticker: ticker.toUpperCase(),
      ...data,
    });
  }
}

export async function getPriceHistory(ticker: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(priceHistory)
    .where(eq(priceHistory.ticker, ticker.toUpperCase()))
    .orderBy(priceHistory.date)
    .limit(limit);
}
