import { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: string;
}

interface PriceChartProps {
  data: PriceData[];
  isLoading: boolean;
  ticker: string;
  timeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";
  onTimeframeChange: (timeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y") => void;
}

const timeframes: Array<"1D" | "1W" | "1M" | "3M" | "1Y" | "5Y"> = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

export default function PriceChart({
  data,
  isLoading,
  ticker,
  timeframe,
  onTimeframeChange,
}: PriceChartProps) {
  // Format data for chart
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      close: item.close / 100,
      open: item.open / 100,
      high: item.high / 100,
      low: item.low / 100,
      volume: item.volume ? parseInt(item.volume) : 0,
    }));
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 0, avg: 0, change: 0 };

    const closes = chartData.map((d) => d.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
    const change = closes[closes.length - 1] - closes[0];

    return { min, max, avg, change };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  const isPositive = stats.change >= 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{ticker} Price Chart</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {chartData.length > 0 && `${chartData.length} data points`}
            </p>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeframeChange(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">High</p>
            <p className="text-lg font-semibold">${stats.max.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Low</p>
            <p className="text-lg font-semibold">${stats.min.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Average</p>
            <p className="text-lg font-semibold">${stats.avg.toFixed(2)}</p>
          </div>

          <div className={`p-3 rounded-lg ${isPositive ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}>
            <p className={`text-xs mb-1 ${isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              Change
            </p>
            <p className={`text-lg font-semibold ${isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              {isPositive ? "+" : ""}{stats.change.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Line Chart */}
        {chartData.length > 0 ? (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? "#10b981" : "#ef4444"}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? "#10b981" : "#ef4444"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClose)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            No data available for this timeframe
          </div>
        )}

        {/* Volume Chart */}
        {chartData.some((d) => d.volume > 0) && (
          <div className="h-32 w-full mt-6">
            <h3 className="text-sm font-semibold mb-3">Volume</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Bar dataKey="volume" fill="var(--primary)" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
