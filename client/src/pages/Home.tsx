import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import DashboardHeader from "@/components/DashboardHeader";
import StockSearchResults from "@/components/StockSearchResults";
import FeaturedStocks from "@/components/FeaturedStocks";
import { Link } from "wouter";
import { BarChart3, TrendingUp, Zap } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // Search stocks
  const searchQuery_trimmed = searchQuery.trim();
  const searchMutation = trpc.stocks.search.useQuery(
    { query: searchQuery_trimmed },
    { enabled: searchQuery_trimmed.length > 0 }
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Featured stocks data (mock)
  const featuredStocks = [
    { ticker: "AAPL", name: "Apple Inc.", price: 195.87, change: 2.45, changePercent: 1.27 },
    { ticker: "GOOGL", name: "Alphabet Inc.", price: 140.23, change: -1.23, changePercent: -0.87 },
    { ticker: "MSFT", name: "Microsoft Corp.", price: 420.45, change: 5.67, changePercent: 1.37 },
    { ticker: "AMZN", name: "Amazon.com Inc.", price: 182.34, change: 3.21, changePercent: 1.79 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onSearch={handleSearch} isLoading={searchMutation.isLoading} />

      {/* Hero Section */}
      {!searchQuery && (
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
          <div className="container py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Smart Stock Analysis
              </h1>
              <p className="text-xl text-muted-foreground">
                Real-time market data, technical analysis, and portfolio tracking in one elegant platform.
              </p>

              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" asChild>
                    <a href={getLoginUrl()}>Get Started</a>
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" asChild>
                    <Link href="/watchlist">View Watchlist</Link>
                  </Button>
                  <Button size="lg" asChild variant="outline">
                    <Link href="/portfolio">My Portfolio</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Search Results or Featured Stocks */}
      <section className="container py-12">
        {searchQuery ? (
          <StockSearchResults
            results={searchMutation.data || []}
            isLoading={searchMutation.isLoading}
            query={searchQuery}
            onSelectStock={setSelectedStock}
          />
        ) : (
          <>
            <FeaturedStocks stocks={featuredStocks} isLoading={false} />

            {/* Features Section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Real-Time Data</h3>
                <p className="text-muted-foreground">
                  Get live stock prices, charts, and market data updated in real-time.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Technical Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced indicators including moving averages, RSI, MACD, and volume analysis.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Portfolio Tracking</h3>
                <p className="text-muted-foreground">
                  Manage your holdings, track performance, and analyze your investment portfolio.
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
