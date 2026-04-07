import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface SearchResult {
  ticker: string;
  name: string;
  type: string;
  region: string;
}

interface StockSearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onSelectStock?: (ticker: string) => void;
}

export default function StockSearchResults({
  results,
  isLoading,
  query,
  onSelectStock,
}: StockSearchResultsProps) {
  if (!query && !isLoading) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </Card>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-2">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </h3>
          <div className="space-y-1">
            {results.map((result) => (
              <Link
                key={result.ticker}
                href={`/stock/${result.ticker}`}
                onClick={() => onSelectStock?.(result.ticker)}
              >
                <Card className="p-4 hover:bg-muted cursor-pointer transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{result.ticker}</span>
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{result.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{result.region}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No stocks found for "{query}"</p>
          <p className="text-xs text-muted-foreground mt-2">Try searching by ticker symbol (e.g., AAPL) or company name</p>
        </div>
      )}
    </div>
  );
}
