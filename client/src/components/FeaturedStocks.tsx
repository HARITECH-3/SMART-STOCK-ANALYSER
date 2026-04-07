import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";

interface FeaturedStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface FeaturedStocksProps {
  stocks: FeaturedStock[];
  isLoading: boolean;
  title?: string;
}

export default function FeaturedStocks({
  stocks,
  isLoading,
  title = "Featured Stocks",
}: FeaturedStocksProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stocks.map((stock) => {
          const isPositive = stock.change >= 0;
          return (
            <Link key={stock.ticker} href={`/stock/${stock.ticker}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">{stock.ticker}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stock.name}</p>
                    </div>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <p className="price-large">${stock.price.toFixed(2)}</p>
                  </div>

                  {/* Change */}
                  <div className={`flex items-center gap-2 ${isPositive ? "text-positive" : "text-negative"}`}>
                    <span className="font-semibold">
                      {isPositive ? "+" : ""}{stock.change.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold">
                      ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
