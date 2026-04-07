import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Watchlist() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  // Fetch watchlist
  const watchlistQuery = trpc.stocks.getWatchlist.useQuery();

  // Fetch quotes for all watchlist items
  const stockQueries = (watchlistQuery.data || []).map((item) =>
    trpc.stocks.getQuote.useQuery(
      { ticker: item.ticker },
      { enabled: !!item.ticker }
    )
  );

  // Remove from watchlist
  const removeFromWatchlistMutation = trpc.stocks.removeFromWatchlist.useMutation({
    onSuccess: () => {
      toast.success("Removed from watchlist");
      watchlistQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to remove from watchlist");
    },
  });

  const handleRemove = (ticker: string) => {
    removeFromWatchlistMutation.mutate({ ticker });
  };

  if (watchlistQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const watchlistItems = watchlistQuery.data || [];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

        {watchlistItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              Your watchlist is empty. Start by searching for stocks to add them.
            </p>
            <Button asChild>
              <Link href="/">Search Stocks</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {watchlistItems.map((item, index) => {
              const quote = stockQueries[index]?.data;
              const changeValue = quote && quote.change ? (typeof quote.change === 'string' ? parseFloat(quote.change) : quote.change) : 0;
              const isPositive = changeValue >= 0;

              return (
                <Card key={item.ticker} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <Link href={`/stock/${item.ticker}`}>
                      <div className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-lg">{item.ticker}</p>
                            <p className="text-sm text-muted-foreground">{item.companyName}</p>
                          </div>
                        </div>

                        {quote ? (
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-2xl font-bold">
                                ${quote.currentPrice ? (quote.currentPrice / 100).toFixed(2) : 'N/A'}
                              </p>
                            </div>

                            <div className={`flex items-center gap-2 ${isPositive ? "text-positive" : "text-negative"}`}>
                              {isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span className="font-semibold">
                                {isPositive ? "+" : ""}
                                {changeValue ? (changeValue / 100).toFixed(2) : '0.00'} (
                                {isPositive ? "+" : ""}
                                {quote.changePercent ? (typeof quote.changePercent === 'string' ? parseFloat(quote.changePercent) : quote.changePercent).toFixed(2) : '0.00'}%)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Loading...</p>
                        )}
                      </div>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.ticker)}
                      disabled={removeFromWatchlistMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
