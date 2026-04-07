import { useState } from "react";
import { Search, TrendingUp, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export default function DashboardHeader({ onSearch, isLoading }: DashboardHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between gap-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline">Stock Analyzer</span>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stocks by ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              disabled={isLoading}
            />
          </div>
        </form>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/watchlist" className="text-sm font-medium hover:text-primary transition-colors">
            Watchlist
          </Link>
          <Link href="/portfolio" className="text-sm font-medium hover:text-primary transition-colors">
            Portfolio
          </Link>
          <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors">
            Compare
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <a href={getLoginUrl()}>Login</a>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading}>
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-2">
              <Link href="/watchlist" className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                Watchlist
              </Link>
              <Link href="/portfolio" className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                Portfolio
              </Link>
              <Link href="/compare" className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                Compare
              </Link>
            </nav>

            {/* Mobile Auth */}
            <div className="flex gap-2 pt-2 border-t border-border">
              {isAuthenticated && user ? (
                <>
                  <span className="text-sm text-muted-foreground flex-1">{user.name || user.email}</span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button size="sm" asChild className="w-full">
                  <a href={getLoginUrl()}>Login</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
