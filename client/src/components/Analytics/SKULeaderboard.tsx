import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, ArrowUpDown, Filter } from "lucide-react";

interface SKULeaderboardData {
  sku: string;
  product: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  avgOrderValue: number;
  margin: number;
}

export function SKULeaderboard() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'unitsSold' | 'revenue' | 'profit' | 'margin'>('revenue');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [category, setCategory] = useState<string>("all");

  // Build filters object
  const filters = {
    sortBy,
    order,
    category: category !== "all" ? category : undefined
  };

  // Fetch SKU leaderboard data
  const { data: leaderboardData = [], isLoading } = useQuery({
    queryKey: ["/api/analytics/sku-leaderboard", filters],
    enabled: !!user,
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const params = new URLSearchParams();
        
        params.append("sortBy", filters.sortBy);
        params.append("order", filters.order);
        if (filters.category) params.append("category", filters.category);

        const response = await fetch(`/api/analytics/sku-leaderboard?${params.toString()}`, {
          headers: authHeaders
        });
        
        if (!response.ok) throw new Error('Failed to fetch SKU leaderboard');
        return response.json() as SKULeaderboardData[];
      } catch (error) {
        console.error('Error fetching SKU leaderboard:', error);
        return [];
      }
    }
  });

  const getPerformanceBadge = (item: SKULeaderboardData, index: number) => {
    if (index === 0) {
      return <Badge className="bg-yellow-500 text-white">🥇 Top Performer</Badge>;
    }
    if (item.margin < 10) {
      return <Badge variant="destructive">🚨 Needs Review</Badge>;
    }
    if (item.margin > 50) {
      return <Badge className="bg-green-500 text-white">⭐ High Margin</Badge>;
    }
    return null;
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setOrder('desc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy === field) {
      return order === 'desc' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />;
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Leaderboard Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Sort By</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <SelectItem value="revenue">Highest Revenue</SelectItem>
                  <SelectItem value="unitsSold">Most Sold</SelectItem>
                  <SelectItem value="profit">Highest Profit</SelectItem>
                  <SelectItem value="margin">Highest Margin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Order</label>
              <Select value={order} onValueChange={(value) => setOrder(value as typeof order)}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <SelectItem value="desc">Highest to Lowest</SelectItem>
                  <SelectItem value="asc">Lowest to Highest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {leaderboardData.length} SKUs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>SKU Performance Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading leaderboard...</div>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">No sales data found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('unitsSold')}
                        className="h-auto p-0 font-medium text-black dark:text-white hover:text-[#fd7014]"
                      >
                        Units Sold {getSortIcon('unitsSold')}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('revenue')}
                        className="h-auto p-0 font-medium text-black dark:text-white hover:text-[#fd7014]"
                      >
                        Revenue {getSortIcon('revenue')}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('profit')}
                        className="h-auto p-0 font-medium text-black dark:text-white hover:text-[#fd7014]"
                      >
                        Profit {getSortIcon('profit')}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">AOV</th>
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('margin')}
                        className="h-auto p-0 font-medium text-black dark:text-white hover:text-[#fd7014]"
                      >
                        Margin {getSortIcon('margin')}
                      </Button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-black dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((item, index) => (
                    <tr 
                      key={item.sku}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-black dark:text-white font-medium">#{index + 1}</span>
                          {index < 3 && (
                            <span className="text-lg">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-sm text-black dark:text-white">
                          {item.sku}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-black dark:text-white">{item.product}</td>
                      <td className="py-3 px-4 text-black dark:text-white font-medium">{item.unitsSold}</td>
                      <td className="py-3 px-4 text-black dark:text-white font-medium">${item.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-black dark:text-white font-medium">${item.profit.toFixed(2)}</td>
                      <td className="py-3 px-4 text-black dark:text-white">${item.avgOrderValue.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${item.margin >= 30 ? 'text-green-600' : item.margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {item.margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getPerformanceBadge(item, index)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}