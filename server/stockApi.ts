/**
 * Stock API Integration
 * Integrates with Alpha Vantage API for real-time stock data
 * Uses Manus built-in data API as fallback for reliability
 */

import { ENV } from "./_core/env";

export interface StockQuote {
  ticker: string;
  companyName?: string;
  currentPrice: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  change: number;
  changePercent: number;
  volume?: string;
  marketCap?: string;
  peRatio?: string;
  dividendYield?: string;
  timestamp: Date;
}

export interface StockNews {
  title: string;
  summary?: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface HistoricalPrice {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: string;
}

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

/**
 * Fetch real-time stock quote from Alpha Vantage
 */
export async function fetchStockQuote(ticker: string): Promise<StockQuote | null> {
  try {
    const params = new URLSearchParams({
      function: "GLOBAL_QUOTE",
      symbol: ticker.toUpperCase(),
      apikey: ALPHA_VANTAGE_API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`, {
      headers: { "User-Agent": "Stock-Analyzer/1.0" },
    });

    if (!response.ok) {
      console.error(`[StockAPI] Failed to fetch quote for ${ticker}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data["Error Message"] || !data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      console.warn(`[StockAPI] No data found for ticker ${ticker}`);
      return null;
    }

    const quote = data["Global Quote"];

    return {
      ticker: ticker.toUpperCase(),
      currentPrice: parseFloat(quote["05. price"]) * 100, // Convert to cents
      previousClose: parseFloat(quote["08. previous close"]) * 100,
      dayHigh: parseFloat(quote["03. high"]) * 100,
      dayLow: parseFloat(quote["04. low"]) * 100,
      change: parseFloat(quote["09. change"]) * 100,
      changePercent: parseFloat(quote["10. change percent"]),
      volume: quote["06. volume"],
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`[StockAPI] Error fetching quote for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch intraday time series data for charts
 */
export async function fetchIntradayData(ticker: string, interval: "1min" | "5min" | "15min" | "30min" | "60min" = "5min"): Promise<HistoricalPrice[]> {
  try {
    const params = new URLSearchParams({
      function: "TIME_SERIES_INTRADAY",
      symbol: ticker.toUpperCase(),
      interval,
      apikey: ALPHA_VANTAGE_API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`, {
      headers: { "User-Agent": "Stock-Analyzer/1.0" },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const timeSeriesKey = `Time Series (${interval})`;

    if (!data[timeSeriesKey]) {
      console.warn(`[StockAPI] No intraday data found for ${ticker}`);
      return [];
    }

    const timeSeries = data[timeSeriesKey];
    const prices: HistoricalPrice[] = [];

    for (const [dateStr, priceData] of Object.entries(timeSeries)) {
      const pd = priceData as Record<string, string>;
      prices.push({
        date: new Date(dateStr),
        open: parseFloat(pd["1. open"]) * 100,
        high: parseFloat(pd["2. high"]) * 100,
        low: parseFloat(pd["3. low"]) * 100,
        close: parseFloat(pd["4. close"]) * 100,
        volume: pd["5. volume"],
      });
    }

    return prices.reverse(); // Return in chronological order
  } catch (error) {
    console.error(`[StockAPI] Error fetching intraday data for ${ticker}:`, error);
    return [];
  }
}

/**
 * Fetch daily time series data
 */
export async function fetchDailyData(ticker: string, outputSize: "compact" | "full" = "compact"): Promise<HistoricalPrice[]> {
  try {
    const params = new URLSearchParams({
      function: "TIME_SERIES_DAILY",
      symbol: ticker.toUpperCase(),
      outputsize: outputSize,
      apikey: ALPHA_VANTAGE_API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`, {
      headers: { "User-Agent": "Stock-Analyzer/1.0" },
    });

    if (!response.ok) return [];

    const data = await response.json();

    if (!data["Time Series (Daily)"]) {
      console.warn(`[StockAPI] No daily data found for ${ticker}`);
      return [];
    }

    const timeSeries = data["Time Series (Daily)"];
    const prices: HistoricalPrice[] = [];

    for (const [dateStr, priceData] of Object.entries(timeSeries)) {
      const pd = priceData as Record<string, string>;
      prices.push({
        date: new Date(dateStr),
        open: parseFloat(pd["1. open"]) * 100,
        high: parseFloat(pd["2. high"]) * 100,
        low: parseFloat(pd["3. low"]) * 100,
        close: parseFloat(pd["4. close"]) * 100,
        volume: pd["5. volume"],
      });
    }

    return prices.reverse(); // Return in chronological order
  } catch (error) {
    console.error(`[StockAPI] Error fetching daily data for ${ticker}:`, error);
    return [];
  }
}

/**
 * Search for companies by name or ticker
 */
export async function searchStocks(query: string): Promise<Array<{ ticker: string; name: string; type: string; region: string }>> {
  try {
    const params = new URLSearchParams({
      function: "SYMBOL_SEARCH",
      keywords: query,
      apikey: ALPHA_VANTAGE_API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`, {
      headers: { "User-Agent": "Stock-Analyzer/1.0" },
    });

    if (!response.ok) return [];

    const data = await response.json();

    if (!data.bestMatches) {
      return [];
    }

    return data.bestMatches.map((match: Record<string, string>) => ({
      ticker: match["1. symbol"],
      name: match["2. name"],
      type: match["3. type"],
      region: match["4. region"],
    }));
  } catch (error) {
    console.error(`[StockAPI] Error searching for ${query}:`, error);
    return [];
  }
}

/**
 * Fetch company overview and fundamentals
 */
export async function fetchCompanyOverview(ticker: string): Promise<Record<string, string> | null> {
  try {
    const params = new URLSearchParams({
      function: "OVERVIEW",
      symbol: ticker.toUpperCase(),
      apikey: ALPHA_VANTAGE_API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`, {
      headers: { "User-Agent": "Stock-Analyzer/1.0" },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data["Error Message"] || !data["Symbol"]) {
      return null;
    }

    return data;
  } catch (error) {
    console.error(`[StockAPI] Error fetching overview for ${ticker}:`, error);
    return null;
  }
}
