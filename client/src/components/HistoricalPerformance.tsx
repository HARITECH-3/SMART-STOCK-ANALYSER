import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceMetric {
  period: string;
  return: number;
  startPrice: number;
  endPrice: number;
  highPrice: number;
  lowPrice: number;
}

interface HistoricalPerformanceProps {
  metrics: PerformanceMetric[];
  isLoading: boolean;
  ticker: string;
}

export default function HistoricalPerformance({
  metrics,
  isLoading,
  ticker,
}: HistoricalPerformanceProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Historical Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 bg-muted rounded-lg">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const defaultMetrics: PerformanceMetric[] = [
    {
      period: "1 Month",
      return: 2.5,
      startPrice: 150.0,
      endPrice: 153.75,
      highPrice: 155.0,
      lowPrice: 149.5,
    },
    {
      period: "3 Months",
      return: 5.8,
      startPrice: 145.0,
      endPrice: 153.41,
      highPrice: 156.0,
      lowPrice: 144.0,
    },
    {
      period: "6 Months",
      return: 12.3,
      startPrice: 136.5,
      endPrice: 153.27,
      highPrice: 158.0,
      lowPrice: 135.0,
    },
    {
      period: "1 Year",
      return: 28.5,
      startPrice: 119.5,
      endPrice: 153.65,
      highPrice: 165.0,
      lowPrice: 118.0,
    },
    {
      period: "5 Years",
      return: 185.3,
      startPrice: 53.8,
      endPrice: 153.45,
      highPrice: 168.0,
      lowPrice: 52.0,
    },
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">{ticker} - Historical Performance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {displayMetrics.map((metric) => {
          const isPositive = metric.return >= 0;
          const priceChange = metric.endPrice - metric.startPrice;

          return (
            <div
              key={metric.period}
              className={`p-4 rounded-lg border border-border ${
                isPositive
                  ? "bg-green-50 dark:bg-green-950"
                  : "bg-red-50 dark:bg-red-950"
              }`}
            >
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                {metric.period}
              </p>

              <div className="space-y-3">
                {/* Return Percentage */}
                <div>
                  <p className={`text-2xl font-bold ${isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                    {isPositive ? "+" : ""}{metric.return.toFixed(2)}%
                  </p>
                  <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}{priceChange.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Price Range */}
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High:</span>
                    <span className="font-semibold">
                      ${metric.highPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Low:</span>
                    <span className="font-semibold">
                      ${metric.lowPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Price Bar */}
                <div className="mt-2">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isPositive
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.abs(metric.return) * 2)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="font-semibold mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Best Period</p>
            <p className="text-xl font-bold">
              {displayMetrics.reduce((best, current) =>
                current.return > best.return ? current : best
              ).period}
            </p>
            <p className="text-sm text-positive font-semibold">
              +{displayMetrics.reduce((best, current) =>
                current.return > best.return ? current : best
              ).return.toFixed(2)}%
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Worst Period</p>
            <p className="text-xl font-bold">
              {displayMetrics.reduce((worst, current) =>
                current.return < worst.return ? current : worst
              ).period}
            </p>
            <p className="text-sm text-negative font-semibold">
              {displayMetrics.reduce((worst, current) =>
                current.return < worst.return ? current : worst
              ).return.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
