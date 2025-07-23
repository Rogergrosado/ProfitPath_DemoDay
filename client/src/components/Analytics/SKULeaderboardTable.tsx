import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SortableTableHeader, PaginationControls } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";

interface SKULeaderboardItem {
  sku: string;
  product: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  avgOrderValue: number;
  margin: number;
}

interface SKULeaderboardTableProps {
  dateRange?: string;
}

export function SKULeaderboardTable({ dateRange = '30d' }: SKULeaderboardTableProps) {
  const pagination = usePagination({
    initialPageSize: 10,
    initialSortBy: 'revenue',
    initialOrder: 'desc'
  });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/analytics/sku-leaderboard", dateRange, pagination.getQueryParams().toString()],
    queryFn: async () => {
      const params = pagination.getQueryParams();
      params.set('dateRange', dateRange);
      
      const response = await fetch(`/api/analytics/sku-leaderboard?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch SKU leaderboard');
      }
      return response.json();
    }
  });

  const getRankIcon = (index: number) => {
    const rank = (pagination.page - 1) * pagination.pageSize + index + 1;
    
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="h-4 w-4 flex items-center justify-center text-xs font-semibold text-slate-500">#{rank}</span>;
  };

  const getRankBadge = (index: number) => {
    const rank = (pagination.page - 1) * pagination.pageSize + index + 1;
    
    if (rank === 1) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Third Place</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-[#fd7014]" />
            <span>SKU Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const skuData = Array.isArray(data) ? data : data?.results || [];
  const totalPages = data?.totalPages || Math.ceil(skuData.length / pagination.pageSize);
  const currentPage = data?.currentPage || pagination.page;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-[#fd7014]" />
          <span>SKU Performance Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">Rank</th>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('sku')}
                    sortDirection={pagination.sortBy === 'sku' ? pagination.order : null}
                  >
                    SKU / Product
                  </SortableTableHeader>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('unitsSold')}
                    sortDirection={pagination.sortBy === 'unitsSold' ? pagination.order : null}
                  >
                    Units Sold
                  </SortableTableHeader>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('revenue')}
                    sortDirection={pagination.sortBy === 'revenue' ? pagination.order : null}
                  >
                    Revenue
                  </SortableTableHeader>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('profit')}
                    sortDirection={pagination.sortBy === 'profit' ? pagination.order : null}
                  >
                    Profit
                  </SortableTableHeader>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('margin')}
                    sortDirection={pagination.sortBy === 'margin' ? pagination.order : null}
                  >
                    Margin
                  </SortableTableHeader>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {skuData.map((item: SKULeaderboardItem, index: number) => (
                  <tr 
                    key={item.sku} 
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-black dark:text-white">{item.sku}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                          {item.product}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-black dark:text-white">
                        {item.unitsSold.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-black dark:text-white">
                        {formatCurrency(item.revenue)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`font-medium ${item.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(item.profit)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`font-medium ${item.margin >= 20 ? 'text-green-600 dark:text-green-400' : item.margin >= 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatPercentage(item.margin)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getRankBadge(index)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {skuData.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No SKU performance data available for this period.
            </div>
          )}

          {skuData.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pagination.pageSize}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              totalItems={data?.totalItems}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}