import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface StockData {
  ticker: string;
  currentPrice?: number | null;
  change?: number | string | null;
  changePercent?: number | string | null;
  dayHigh?: number | null;
  dayLow?: number | null;
  volume?: string | null;
  previousClose?: number | null;
}

export default function Compare() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch quotes for all tickers
  const quoteQueries = tickers.map((ticker) =>
    trpc.stocks.getQuote.useQuery(
      { ticker },
      { enabled: !!ticker, refetchInterval: 5000 }
    )
  );

  // Search for stocks
  const searchQuery = trpc.stocks.search.useQuery(
    { query: searchInput },
    { enabled: !!searchInput && searchInput.length > 1 }
  );

  const handleAddTicker = (ticker: string) => {
    if (tickers.includes(ticker.toUpperCase())) {
      toast.error("Stock already added");
      return;
    }

    if (tickers.length >= 5) {
      toast.error("Maximum 5 stocks to compare");
      return;
    }

    setTickers([...tickers, ticker.toUpperCase()]);
    setSearchInput("");
  };

  const handleRemoveTicker = (ticker: string) => {
    setTickers(tickers.filter((t) => t !== ticker));
  };

  const stocks: StockData[] = tickers.map((ticker, index) => {
    const quote = quoteQueries[index]?.data;
    return {
      ticker,
      currentPrice: quote?.currentPrice,
      change: quote?.change,
      changePercent: quote?.changePercent,
      dayHigh: quote?.dayHigh,
      dayLow: quote?.dayLow,
      volume: quote?.volume,
      previousClose: quote?.previousClose,
    };
  });

  // Calculate comparison metrics
  const metrics = {
    highestPrice: Math.max(...stocks.filter((s) => s.currentPrice).map((s) => (s.currentPrice || 0) as number)),
    lowestPrice: Math.min(...stocks.filter((s) => s.currentPrice).map((s) => (s.currentPrice || Infinity) as number)),
    bestPerformer: stocks.reduce((best, current) => {
      if (!current.changePercent || !best.changePercent) return best;
      const currentPercent = typeof current.changePercent === 'string' ? parseFloat(current.changePercent) : current.changePercent;
      const bestPercent = typeof best.changePercent === 'string' ? parseFloat(best.changePercent) : best.changePercent;
      return currentPercent > bestPercent ? current : best;
    }),
    worstPerformer: stocks.reduce((worst, current) => {
      if (!current.changePercent || !worst.changePercent) return worst;
      const currentPercent = typeof current.changePercent === 'string' ? parseFloat(current.changePercent) : current.changePercent;
      const worstPercent = typeof worst.changePercent === 'string' ? parseFloat(worst.changePercent) : worst.changePercent;
      return currentPercent < worstPercent ? current : worst;
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Compare Stocks</h1>

        {/* Search and Add */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add Stocks to Compare</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Search by ticker or company name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => handleAddTicker(searchInput)} disabled={!searchInput || tickers.length >= 5}>
              Add
            </Button>
          </div>

          {/* Search Results */}
          {searchQuery.data && searchQuery.data.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchQuery.data.map((result) => (
                <div
                  key={result.ticker}
                  className="p-3 bg-muted rounded-lg flex items-center justify-between cursor-pointer hover:bg-muted/80"
                  onClick={() => handleAddTicker(result.ticker)}
                >
                  <div>
                    <p className="font-semibold">{result.ticker}</p>
                    <p className="text-sm text-muted-foreground">{result.name}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Add
                  </Button>
                </div>              ))}
            </div>
          )}
        </Card>

        {/* Selected Stocks */}
        {tickers.length > 0 && (
          <>
            {/* Comparison Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Highest Price</p>
                <p className="text-2xl font-semibold">${metrics.highestPrice.toFixed(2)}</p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Lowest Price</p>
                <p className="text-2xl font-semibold">${metrics.lowestPrice.toFixed(2)}</p>
              </Card>

              <Card className="p-4 bg-green-50 dark:bg-green-950">
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">Best Performer</p>
                <p className="text-2xl font-semibold text-green-700 dark:text-green-300">
                  {metrics.bestPerformer.ticker}
                </p>
              </Card>

              <Card className="p-4 bg-red-50 dark:bg-red-950">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">Worst Performer</p>
                <p className="text-2xl font-semibold text-red-700 dark:text-red-300">
                  {metrics.worstPerformer.ticker}
                </p>
              </Card>
            </div>

            {/* Comparison Table */}
            <Card className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                    <th className="text-right py-3 px-4 font-semibold">Price</th>
                    <th className="text-right py-3 px-4 font-semibold">Change</th>
                    <th className="text-right py-3 px-4 font-semibold">Change %</th>
                    <th className="text-right py-3 px-4 font-semibold">Day High</th>
                    <th className="text-right py-3 px-4 font-semibold">Day Low</th>
                    <th className="text-right py-3 px-4 font-semibold">Volume</th>
                    <th className="text-center py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock, index) => {
                    const isLoading = quoteQueries[index]?.isLoading;
                    const changeValue = stock.change ? (typeof stock.change === 'string' ? parseFloat(stock.change) : stock.change) : 0;
                    const changePct = stock.changePercent ? (typeof stock.changePercent === 'string' ? parseFloat(stock.changePercent) : stock.changePercent) : 0;
                    const isPositive = changeValue >= 0;

                    return (
                      <tr key={stock.ticker} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">{stock.ticker}</td>
                        <td className="text-right py-3 px-4">
                          {isLoading ? (
                            <Skeleton className="h-4 w-16 ml-auto" />
                          ) : (
                            `$${stock.currentPrice ? (stock.currentPrice / 100).toFixed(2) : 'N/A'}`
                          )}
                        </td>
                        <td className={`text-right py-3 px-4 ${isPositive ? "text-positive" : "text-negative"}`}>
                          {isLoading ? (
                            <Skeleton className="h-4 w-16 ml-auto" />
                          ) : (
                            `${isPositive ? "+" : ""}${(changeValue / 100).toFixed(2)}`
                          )}
                        </td>
                        <td className={`text-right py-3 px-4 font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
                          {isLoading ? (
                            <Skeleton className="h-4 w-16 ml-auto" />
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              {isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {isPositive ? "+" : ""}{changePct.toFixed(2)}%
                            </div>
                          )}
                        </td>
                        <td className="text-right py-3 px-4">
                          {isLoading ? (
                            <Skeleton className="h-4 w-16 ml-auto" />
                          ) : (
                            `$${stock.dayHigh ? (stock.dayHigh / 100).toFixed(2) : 'N/A'}`
                          )}
                        </td>
                        <td className="text-right py-3 px-4">
                          {isLoading ? (
                            <Skeleton className="h-4 w-16 ml-auto" />
                          ) : (
                            `$${stock.dayLow ? (stock.dayLow / 100).toFixed(2) : 'N/A'}`
                          )}
                        </td>
                        <td className="text-right py-3 px-4 text-sm">
                          {isLoading ? (
                            <Skeleton className="h-4 w-16 ml-auto" />
                          ) : (
                            stock.volume || "N/A"
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTicker(stock.ticker)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {tickers.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              Add stocks above to start comparing their performance
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
