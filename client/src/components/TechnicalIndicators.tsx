import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IndicatorData {
  sma20?: number;
  sma50?: number;
  sma200?: number;
  rsi?: number;
  macdLine?: number;
  signalLine?: number;
  histogram?: number;
}

interface TechnicalIndicatorsProps {
  data: IndicatorData;
  isLoading: boolean;
  currentPrice: number;
}

export default function TechnicalIndicators({
  data,
  isLoading,
  currentPrice,
}: TechnicalIndicatorsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Technical Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 bg-muted rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const getIndicatorStatus = (value: number | undefined, type: string) => {
    if (value === undefined) return { status: "neutral", text: "N/A" };

    switch (type) {
      case "rsi":
        if (value > 70) return { status: "overbought", text: "Overbought" };
        if (value < 30) return { status: "oversold", text: "Oversold" };
        return { status: "neutral", text: "Neutral" };

      case "sma":
        if (value > currentPrice) return { status: "bearish", text: "Bearish" };
        if (value < currentPrice) return { status: "bullish", text: "Bullish" };
        return { status: "neutral", text: "Neutral" };

      case "macd":
        if (value > 0) return { status: "bullish", text: "Bullish" };
        if (value < 0) return { status: "bearish", text: "Bearish" };
        return { status: "neutral", text: "Neutral" };

      default:
        return { status: "neutral", text: "N/A" };
    }
  };

  const rsiStatus = getIndicatorStatus(data.rsi, "rsi");
  const sma20Status = getIndicatorStatus(data.sma20, "sma");
  const sma50Status = getIndicatorStatus(data.sma50, "sma");
  const sma200Status = getIndicatorStatus(data.sma200, "sma");
  const macdStatus = getIndicatorStatus(data.macdLine, "macd");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "bullish":
        return "text-green-600 dark:text-green-400";
      case "bearish":
        return "text-red-600 dark:text-red-400";
      case "overbought":
        return "text-red-600 dark:text-red-400";
      case "oversold":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "bullish":
        return "bg-green-100 dark:bg-green-900";
      case "bearish":
        return "bg-red-100 dark:bg-red-900";
      case "overbought":
        return "bg-red-100 dark:bg-red-900";
      case "oversold":
        return "bg-green-100 dark:bg-green-900";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Technical Indicators</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* RSI */}
        {data.rsi !== undefined && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">RSI (14)</p>
            <p className="text-2xl font-semibold mb-2">{data.rsi.toFixed(2)}</p>
            <div className={`flex items-center gap-2 text-sm font-semibold ${getStatusColor(rsiStatus.status)}`}>
              {rsiStatus.status === "overbought" || rsiStatus.status === "bearish" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {rsiStatus.text}
            </div>
          </div>
        )}

        {/* SMA 20 */}
        {data.sma20 !== undefined && (
          <div className={`p-4 rounded-lg ${getStatusBgColor(sma20Status.status)}`}>
            <p className={`text-sm mb-2 ${getStatusColor(sma20Status.status)}`}>SMA (20)</p>
            <p className={`text-2xl font-semibold mb-2 ${getStatusColor(sma20Status.status)}`}>
              ${data.sma20.toFixed(2)}
            </p>
            <div className={`flex items-center gap-2 text-sm font-semibold ${getStatusColor(sma20Status.status)}`}>
              {sma20Status.status === "bearish" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {sma20Status.text}
            </div>
          </div>
        )}

        {/* SMA 50 */}
        {data.sma50 !== undefined && (
          <div className={`p-4 rounded-lg ${getStatusBgColor(sma50Status.status)}`}>
            <p className={`text-sm mb-2 ${getStatusColor(sma50Status.status)}`}>SMA (50)</p>
            <p className={`text-2xl font-semibold mb-2 ${getStatusColor(sma50Status.status)}`}>
              ${data.sma50.toFixed(2)}
            </p>
            <div className={`flex items-center gap-2 text-sm font-semibold ${getStatusColor(sma50Status.status)}`}>
              {sma50Status.status === "bearish" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {sma50Status.text}
            </div>
          </div>
        )}

        {/* SMA 200 */}
        {data.sma200 !== undefined && (
          <div className={`p-4 rounded-lg ${getStatusBgColor(sma200Status.status)}`}>
            <p className={`text-sm mb-2 ${getStatusColor(sma200Status.status)}`}>SMA (200)</p>
            <p className={`text-2xl font-semibold mb-2 ${getStatusColor(sma200Status.status)}`}>
              ${data.sma200.toFixed(2)}
            </p>
            <div className={`flex items-center gap-2 text-sm font-semibold ${getStatusColor(sma200Status.status)}`}>
              {sma200Status.status === "bearish" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {sma200Status.text}
            </div>
          </div>
        )}

        {/* MACD Line */}
        {data.macdLine !== undefined && (
          <div className={`p-4 rounded-lg ${getStatusBgColor(macdStatus.status)}`}>
            <p className={`text-sm mb-2 ${getStatusColor(macdStatus.status)}`}>MACD Line</p>
            <p className={`text-2xl font-semibold mb-2 ${getStatusColor(macdStatus.status)}`}>
              {data.macdLine.toFixed(4)}
            </p>
            <div className={`flex items-center gap-2 text-sm font-semibold ${getStatusColor(macdStatus.status)}`}>
              {macdStatus.status === "bearish" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {macdStatus.text}
            </div>
          </div>
        )}

        {/* Signal Line */}
        {data.signalLine !== undefined && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Signal Line</p>
            <p className="text-2xl font-semibold">{data.signalLine.toFixed(4)}</p>
          </div>
        )}
      </div>

      {/* Indicator Legend */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm font-semibold mb-3">Indicator Guide</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">RSI (Relative Strength Index)</p>
            <p>Measures momentum. Above 70 = Overbought, Below 30 = Oversold</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">SMA (Simple Moving Average)</p>
            <p>Price above SMA = Bullish, Price below SMA = Bearish</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">MACD (Moving Average Convergence Divergence)</p>
            <p>Positive = Bullish momentum, Negative = Bearish momentum</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Signal Line</p>
            <p>9-period EMA of MACD. Used to identify trend changes</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
