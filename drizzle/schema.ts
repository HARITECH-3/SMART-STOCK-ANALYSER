import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Watchlist table - stores user's favorite stocks
export const watchlist = mysqlTable("watchlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = typeof watchlist.$inferInsert;

// Portfolio table - stores user's stock holdings
export const portfolio = mysqlTable("portfolio", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  shares: int("shares").notNull(),
  averageCost: int("averageCost").notNull(), // stored as cents to avoid float precision issues
  currentPrice: int("currentPrice"), // stored as cents
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type Portfolio = typeof portfolio.$inferSelect;
export type InsertPortfolio = typeof portfolio.$inferInsert;

// Stock cache table - stores recent stock data to reduce API calls
export const stockCache = mysqlTable("stockCache", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 10 }).notNull().unique(),
  companyName: varchar("companyName", { length: 255 }),
  currentPrice: int("currentPrice"), // stored as cents
  previousClose: int("previousClose"),
  dayHigh: int("dayHigh"),
  dayLow: int("dayLow"),
  marketCap: varchar("marketCap", { length: 50 }),
  peRatio: varchar("peRatio", { length: 20 }),
  dividendYield: varchar("dividendYield", { length: 20 }),
  volume: varchar("volume", { length: 50 }),
  change: varchar("change", { length: 20 }),
  changePercent: varchar("changePercent", { length: 20 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
});

export type StockCache = typeof stockCache.$inferSelect;
export type InsertStockCache = typeof stockCache.$inferInsert;

// Stock price history table - stores historical price data for charts
export const priceHistory = mysqlTable("priceHistory", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  date: timestamp("date").notNull(),
  open: int("open"), // stored as cents
  high: int("high"),
  low: int("low"),
  close: int("close"),
  volume: varchar("volume", { length: 50 }),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;