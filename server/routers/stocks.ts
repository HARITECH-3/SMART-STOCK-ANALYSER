import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getStockByTicker,
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getUserPortfolio,
  addToPortfolio,
  updatePortfolioHolding,
  removeFromPortfolio,
  updateStockCache,
  getPriceHistory,
} from "../db";
import {
  fetchStockQuote,
  fetchIntradayData,
  fetchDailyData,
  searchStocks,
  fetchCompanyOverview,
} from "../stockApi";

export const stocksRouter = router({
  // Search for stocks by ticker or company name
  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(50) }))
    .query(async ({ input }) => {
      try {
        const results = await searchStocks(input.query);
        return results.slice(0, 10); // Limit to top 10 results
      } catch (error) {
        console.error("Search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search stocks",
        });
      }
    }),

  // Get real-time stock quote
  getQuote: publicProcedure
    .input(z.object({ ticker: z.string().min(1).max(10) }))
    .query(async ({ input }) => {
      try {
        // Try to get from cache first
        let cached = await getStockByTicker(input.ticker);

        // If cache is older than 5 minutes, refresh
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        if (!cached || (cached.lastUpdated && new Date(cached.lastUpdated) < fiveMinutesAgo)) {
          const quote = await fetchStockQuote(input.ticker);
          if (quote) {
            await updateStockCache(input.ticker, {
              currentPrice: quote.currentPrice,
              previousClose: quote.previousClose,
              dayHigh: quote.dayHigh,
              dayLow: quote.dayLow,
              change: quote.change.toString(),
              changePercent: quote.changePercent.toString(),
              volume: quote.volume,
            });
            cached = await getStockByTicker(input.ticker);
          }
        }

        return cached || null;
      } catch (error) {
        console.error("Quote fetch error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch stock quote",
        });
      }
    }),

  // Get company overview and fundamentals
  getOverview: publicProcedure
    .input(z.object({ ticker: z.string().min(1).max(10) }))
    .query(async ({ input }) => {
      try {
        const overview = await fetchCompanyOverview(input.ticker);
        if (!overview) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Company not found",
          });
        }

        // Update cache with fundamental data
        await updateStockCache(input.ticker, {
          companyName: overview["Name"],
          marketCap: overview["MarketCapitalization"],
          peRatio: overview["PERatio"],
          dividendYield: overview["DividendYield"],
        });

        return overview;
      } catch (error) {
        console.error("Overview fetch error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch company overview",
        });
      }
    }),

  // Get historical price data for charts
  getPriceHistory: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        timeframe: z.enum(["1D", "1W", "1M", "3M", "1Y", "5Y"]),
      })
    )
    .query(async ({ input }) => {
      try {
        let prices;

        // Fetch based on timeframe
        if (input.timeframe === "1D") {
          prices = await fetchIntradayData(input.ticker, "5min");
        } else if (input.timeframe === "1W") {
          prices = await fetchIntradayData(input.ticker, "60min");
        } else {
          // For longer timeframes, use daily data
          prices = await fetchDailyData(input.ticker, "full");
        }

        // Filter based on timeframe
        const now = new Date();
        let startDate = new Date();

        switch (input.timeframe) {
          case "1D":
            startDate.setDate(now.getDate() - 1);
            break;
          case "1W":
            startDate.setDate(now.getDate() - 7);
            break;
          case "1M":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "3M":
            startDate.setMonth(now.getMonth() - 3);
            break;
          case "1Y":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case "5Y":
            startDate.setFullYear(now.getFullYear() - 5);
            break;
        }

        return prices.filter((p) => p.date >= startDate);
      } catch (error) {
        console.error("Price history fetch error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch price history",
        });
      }
    }),

  // Watchlist operations
  getWatchlist: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getUserWatchlist(ctx.user.id);
    } catch (error) {
      console.error("Watchlist fetch error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch watchlist",
      });
    }
  }),

  addToWatchlist: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        companyName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await addToWatchlist(ctx.user.id, input.ticker, input.companyName);
        return { success: true };
      } catch (error) {
        console.error("Add to watchlist error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add to watchlist",
        });
      }
    }),

  removeFromWatchlist: protectedProcedure
    .input(z.object({ ticker: z.string().min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await removeFromWatchlist(ctx.user.id, input.ticker);
        return { success: true };
      } catch (error) {
        console.error("Remove from watchlist error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove from watchlist",
        });
      }
    }),

  // Portfolio operations
  getPortfolio: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getUserPortfolio(ctx.user.id);
    } catch (error) {
      console.error("Portfolio fetch error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch portfolio",
      });
    }
  }),

  addToPortfolio: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        shares: z.number().int().positive(),
        averageCost: z.number().positive(),
        companyName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await addToPortfolio(
          ctx.user.id,
          input.ticker,
          input.shares,
          Math.round(input.averageCost * 100), // Convert to cents
          input.companyName
        );
        return { success: true };
      } catch (error) {
        console.error("Add to portfolio error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add to portfolio",
        });
      }
    }),

  updatePortfolioHolding: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number().int(),
        shares: z.number().int().positive(),
        averageCost: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updatePortfolioHolding(
          input.portfolioId,
          input.shares,
          Math.round(input.averageCost * 100)
        );
        return { success: true };
      } catch (error) {
        console.error("Update portfolio error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update portfolio holding",
        });
      }
    }),

  removeFromPortfolio: protectedProcedure
    .input(z.object({ portfolioId: z.number().int() }))
    .mutation(async ({ input }) => {
      try {
        await removeFromPortfolio(input.portfolioId);
        return { success: true };
      } catch (error) {
        console.error("Remove from portfolio error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove from portfolio",
        });
      }
    }),
});
