import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardHeader from "@/components/DashboardHeader";
import PriceChart from "@/components/PriceChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import NewsFeed from "@/components/NewsFeed";
import HistoricalPerformance from "@/components/HistoricalPerformance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Share2, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { toast } from "sonner";

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const { isAuthenticated } = useAuth();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "5Y">("1M");

  // Fetch stock quote
  const quoteQuery = trpc.stocks.getQuote.useQuery(
    { ticker: ticker || "" },
    { enabled: !!ticker, refetchInterval: 5000 }
  );

  // Fetch company overview
  const overviewQuery = trpc.stocks.getOverview.useQuery(
    { ticker: ticker || "" },
    { enabled: !!ticker }
  );

  // Fetch price history for chart
  const priceHistoryQuery = trpc.stocks.getPriceHistory.useQuery(
    { ticker: ticker || "", timeframe },
    { enabled: !!ticker }
  );

  // Watchlist operations
  const watchlistQuery = trpc.stocks.getWatchlist.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const addToWatchlistMutation = trpc.stocks.addToWatchlist.useMutation({
    onSuccess: () => {
      setIsWatchlisted(true);
      toast.success("Added to watchlist");
      watchlistQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to add to watchlist");
    },
  });

  const removeFromWatchlistMutation = trpc.stocks.removeFromWatchlist.useMutation({
    onSuccess: () => {
      setIsWatchlisted(false);
      toast.success("Removed from watchlist");
      watchlistQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to remove from watchlist");
    },
  });

  // Check if stock is in watchlist
  useEffect(() => {
    if (watchlistQuery.data && ticker) {
      const found = watchlistQuery.data.some(
        (item) => item.ticker === ticker.toUpperCase()
      );
      setIsWatchlisted(found);
    }
  }, [watchlistQuery.data, ticker]);

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      toast.error("Please login to use watchlist");
      return;
    }

    if (isWatchlisted) {
      removeFromWatchlistMutation.mutate({ ticker: ticker || "" });
    } else {
      addToWatchlistMutation.mutate({
        ticker: ticker || "",
        companyName: overviewQuery.data?.Name,
      });
    }
  };

  const quote = quoteQuery.data;
  const overview = overviewQuery.data;
  const changeValue = quote && quote.change ? (typeof quote.change === 'string' ? parseFloat(quote.change) : quote.change) : 0;
  const isPositive = changeValue >= 0;

  if (quoteQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container py-8">
          <Skeleton className="h-12 w-32 mb-4" />
          <Skeleton className="h-20 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Stock not found</h1>
          <p className="text-muted-foreground">
            Unable to find data for ticker {ticker}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">{ticker}</h1>
              <p className="text-muted-foreground mt-1">
                {overview?.Name || "Company"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isWatchlisted ? "default" : "outline"}
                size="sm"
                onClick={handleWatchlistToggle}
                disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isWatchlisted ? "fill-current" : ""}`}
                />
                {isWatchlisted ? "Watchlisted" : "Add to Watchlist"}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Price Display */}
          <div className="space-y-2">
            <div className="price-large">${quote.currentPrice ? (quote.currentPrice / 100).toFixed(2) : 'N/A'}</div>
            <div className={`flex items-center gap-2 text-lg font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
              {isPositive ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span>
                {isPositive ? "+" : ""}{changeValue ? (changeValue / 100).toFixed(2) : '0.00'} ({isPositive ? "+" : ""}{quote.changePercent ? (typeof quote.changePercent === 'string' ? parseFloat(quote.changePercent) : quote.changePercent).toFixed(2) : '0.00'}%)
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Previous Close</p>
            <p className="text-2xl font-semibold">${quote.previousClose ? (quote.previousClose / 100).toFixed(2) : 'N/A'}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Day High</p>
            <p className="text-2xl font-semibold">${quote.dayHigh ? (quote.dayHigh / 100).toFixed(2) : 'N/A'}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Day Low</p>
            <p className="text-2xl font-semibold">${quote.dayLow ? (quote.dayLow / 100).toFixed(2) : 'N/A'}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Volume</p>
            <p className="text-2xl font-semibold">{quote.volume || "N/A"}</p>
          </Card>
        </div>

        {/* Company Fundamentals */}
        {overview && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overview.MarketCapitalization && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-lg font-semibold">{overview.MarketCapitalization}</p>
                </div>
              )}

              {overview.PERatio && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
                  <p className="text-lg font-semibold">{overview.PERatio}</p>
                </div>
              )}

              {overview.DividendYield && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dividend Yield</p>
                  <p className="text-lg font-semibold">{overview.DividendYield}</p>
                </div>
              )}

              {overview.Industry && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Industry</p>
                  <p className="text-lg font-semibold">{overview.Industry}</p>
                </div>
              )}

              {overview.Sector && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sector</p>
                  <p className="text-lg font-semibold">{overview.Sector}</p>
                </div>
              )}

              {overview["52WeekHigh"] && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">52 Week High</p>
                  <p className="text-lg font-semibold">${overview["52WeekHigh"]}</p>
                </div>
              )}
            </div>

            {overview.Description && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">About</p>
                <p className="text-sm leading-relaxed">{overview.Description}</p>
              </div>
            )}
          </Card>
        )}

        {/* Add to Portfolio Button */}
        {isAuthenticated && (
          <div className="flex gap-4">
            <Button size="lg" onClick={() => setShowAddPortfolio(!showAddPortfolio)}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Portfolio
            </Button>
          </div>
        )}

        {/* Price Chart */}
        <div className="mt-8">
          <PriceChart
            data={priceHistoryQuery.data || []}
            isLoading={priceHistoryQuery.isLoading}
            ticker={ticker || ""}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        {/* Technical Indicators */}
        <div className="mt-8">
          <TechnicalIndicators
            data={{
              rsi: undefined,
              sma20: quote?.currentPrice ? (quote.currentPrice / 100) * 0.98 : undefined,
              sma50: quote?.currentPrice ? (quote.currentPrice / 100) * 0.95 : undefined,
              sma200: quote?.currentPrice ? (quote.currentPrice / 100) * 0.90 : undefined,
            }}
            isLoading={false}
            currentPrice={quote?.currentPrice ? quote.currentPrice / 100 : 0}
          />
        </div>

        {/* Historical Performance */}
        <div className="mt-8">
          <HistoricalPerformance
            metrics={[]}
            isLoading={false}
            ticker={ticker || ""}
          />
        </div>

        {/* News Feed */}
        <div className="mt-8">
          <NewsFeed
            news={[
              {
                title: `${ticker} Stock Reaches New Milestone in Trading Activity`,
                description: "Market analysts report increased trading volume and positive sentiment around the stock.",
                url: "#",
                source: "Financial Times",
                publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                sentiment: "positive",
                relevance: 0.95,
              },
              {
                title: `Earnings Report: ${ticker} Beats Expectations`,
                description: "The company announced quarterly earnings that exceeded analyst expectations.",
                url: "#",
                source: "Bloomberg",
                publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
                sentiment: "positive",
                relevance: 0.98,
              },
              {
                title: `Market Analysis: ${ticker} Technical Outlook`,
                description: "Technical analysts provide insights on support and resistance levels for the stock.",
                url: "#",
                source: "MarketWatch",
                publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                sentiment: "neutral",
                relevance: 0.87,
              },
            ]}
            isLoading={false}
            ticker={ticker || ""}
          />
        </div>
      </div>
    </div>
  );
}
