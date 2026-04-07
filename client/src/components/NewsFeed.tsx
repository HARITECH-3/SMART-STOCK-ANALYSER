import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment?: "positive" | "negative" | "neutral";
  relevance?: number;
}

interface NewsFeedProps {
  news: NewsItem[];
  isLoading: boolean;
  ticker: string;
}

export default function NewsFeed({ news, isLoading, ticker }: NewsFeedProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Latest News</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-border rounded-lg">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "negative":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      default:
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4" />;
      case "negative":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Latest News - {ticker}</h2>

      {news.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No news available at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="text-lg font-semibold leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                    {item.sentiment && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getSentimentColor(item.sentiment)}`}>
                        {getSentimentIcon(item.sentiment)}
                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.publishedAt)}
                    </div>
                    <span className="text-xs font-medium">{item.source}</span>
                    {item.relevance && (
                      <span className="text-xs">
                        Relevance: {(item.relevance * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(item.url, "_blank");
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
