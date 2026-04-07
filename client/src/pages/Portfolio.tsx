import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit2, Plus, TrendingUp, TrendingDown, Briefcase } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface PortfolioHolding {
  id: number;
  ticker: string;
  companyName?: string;
  shares: number;
  averageCost: number;
  currentPrice?: number;
  lastUpdated?: Date;
}

export default function Portfolio() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    ticker: "",
    shares: "",
    averageCost: "",
    companyName: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  // Fetch portfolio
  const portfolioQuery = trpc.stocks.getPortfolio.useQuery();

  // Add to portfolio
  const addToPortfolioMutation = trpc.stocks.addToPortfolio.useMutation({
    onSuccess: () => {
      toast.success("Stock added to portfolio");
      setFormData({ ticker: "", shares: "", averageCost: "", companyName: "" });
      setShowAddForm(false);
      portfolioQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to add stock to portfolio");
    },
  });

  // Remove from portfolio
  const removeFromPortfolioMutation = trpc.stocks.removeFromPortfolio.useMutation({
    onSuccess: () => {
      toast.success("Stock removed from portfolio");
      portfolioQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to remove stock from portfolio");
    },
  });

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ticker || !formData.shares || !formData.averageCost) {
      toast.error("Please fill in all required fields");
      return;
    }

    addToPortfolioMutation.mutate({
      ticker: formData.ticker,
      shares: parseInt(formData.shares),
      averageCost: parseFloat(formData.averageCost),
      companyName: formData.companyName || undefined,
    });
  };

  const handleRemove = (id: number) => {
    if (confirm("Are you sure you want to remove this stock from your portfolio?")) {
      removeFromPortfolioMutation.mutate({ portfolioId: id });
    }
  };

  const portfolio = portfolioQuery.data || [];

  // Calculate portfolio statistics
  const stats = portfolio.reduce(
    (acc, holding) => {
      const investmentValue = (holding.averageCost * holding.shares) / 100;
      const currentValue = holding.currentPrice
        ? (holding.currentPrice * holding.shares) / 100
        : investmentValue;
      const gain = currentValue - investmentValue;

      return {
        totalInvested: acc.totalInvested + investmentValue,
        totalCurrent: acc.totalCurrent + currentValue,
        totalGain: acc.totalGain + gain,
        totalShares: acc.totalShares + holding.shares,
      };
    },
    { totalInvested: 0, totalCurrent: 0, totalGain: 0, totalShares: 0 }
  );

  const gainPercent = stats.totalInvested > 0 ? (stats.totalGain / stats.totalInvested) * 100 : 0;
  const isPositive = stats.totalGain >= 0;

  if (portfolioQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container py-8">
          <Skeleton className="h-12 w-32 mb-4" />
          <Skeleton className="h-32 w-full mb-8" />
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>

        {/* Portfolio Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
            <p className="text-2xl font-semibold">${stats.totalInvested.toFixed(2)}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Current Value</p>
            <p className="text-2xl font-semibold">${stats.totalCurrent.toFixed(2)}</p>
          </Card>

          <Card className={`p-4 ${isPositive ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
            <p className={`text-sm mb-2 ${isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              Total Gain/Loss
            </p>
            <p className={`text-2xl font-semibold ${isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              {isPositive ? "+" : ""}{stats.totalGain.toFixed(2)}
            </p>
          </Card>

          <Card className={`p-4 ${isPositive ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
            <p className={`text-sm mb-2 ${isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              Return %
            </p>
            <p className={`text-2xl font-semibold ${isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              {isPositive ? "+" : ""}{gainPercent.toFixed(2)}%
            </p>
          </Card>
        </div>

        {/* Add Stock Form */}
        {showAddForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Add Stock to Portfolio</h2>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Ticker Symbol *</label>
                  <Input
                    placeholder="e.g., AAPL"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    disabled={addToPortfolioMutation.isPending}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Company Name</label>
                  <Input
                    placeholder="e.g., Apple Inc."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    disabled={addToPortfolioMutation.isPending}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Number of Shares *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    disabled={addToPortfolioMutation.isPending}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Average Cost per Share *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 150.50"
                    step="0.01"
                    value={formData.averageCost}
                    onChange={(e) => setFormData({ ...formData, averageCost: e.target.value })}
                    disabled={addToPortfolioMutation.isPending}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={addToPortfolioMutation.isPending}>
                  Add to Portfolio
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ ticker: "", shares: "", averageCost: "", companyName: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Holdings List */}
        {portfolio.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Your portfolio is empty. Start by adding stocks.</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Stock
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {portfolio.map((holding) => {
              const investmentValue = (holding.averageCost * holding.shares) / 100;
              const currentValue = holding.currentPrice
                ? (holding.currentPrice * holding.shares) / 100
                : investmentValue;
              const gain = currentValue - investmentValue;
              const gainPercent = (gain / investmentValue) * 100;
              const isHoldingPositive = gain >= 0;

              return (
                <Card key={holding.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <Link href={`/stock/${holding.ticker}`}>
                      <div className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-lg">{holding.ticker}</p>
                            <p className="text-sm text-muted-foreground">{holding.companyName}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Shares</p>
                            <p className="font-semibold">{holding.shares}</p>
                          </div>

                          <div>
                            <p className="text-muted-foreground">Avg Cost</p>
                            <p className="font-semibold">${(holding.averageCost / 100).toFixed(2)}</p>
                          </div>

                          <div>
                            <p className="text-muted-foreground">Invested</p>
                            <p className="font-semibold">${investmentValue.toFixed(2)}</p>
                          </div>

                          <div>
                            <p className="text-muted-foreground">Current Value</p>
                            <p className="font-semibold">${currentValue.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className={`flex items-center gap-2 mt-3 ${isHoldingPositive ? "text-positive" : "text-negative"}`}>
                          {isHoldingPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-semibold">
                            {isHoldingPositive ? "+" : ""}{gain.toFixed(2)} ({isHoldingPositive ? "+" : ""}{gainPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(holding.id)}
                        disabled={removeFromPortfolioMutation.isPending}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(holding.id)}
                        disabled={removeFromPortfolioMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
