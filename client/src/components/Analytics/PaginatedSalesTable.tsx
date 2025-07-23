import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableTableHeader, PaginationControls } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import { DollarSign, TrendingUp, Calendar, Package } from "lucide-react";

interface SaleItem {
  id: number;
  userId: number;
  inventoryId: number;
  sku: string;
  productName: string;
  quantity: number;
  totalRevenue: string;
  profit: string;
  saleDate: string;
  marketplace?: string;
  category?: string;
}

interface PaginatedSalesTableProps {
  className?: string;
  dateRange?: string;
}

export function PaginatedSalesTable({ className, dateRange }: PaginatedSalesTableProps) {
  const { user } = useAuth();

  const pagination = usePagination({
    initialPageSize: 10,
    initialSortBy: 'saleDate',
    initialOrder: 'desc'
  });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/sales", dateRange, pagination.getQueryParams().toString()],
    enabled: !!user,
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const params = pagination.getQueryParams();
      
      if (dateRange) {
        params.set('range', dateRange);
      }
      
      const response = await fetch(`/api/sales?${params.toString()}`, {
        headers: authHeaders
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      return response.json();
    }
  });

  const salesData = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || pagination.page;

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProfitStatus = (profit: string | number) => {
    const profitNum = typeof profit === 'string' ? parseFloat(profit) : profit;
    if (profitNum > 0) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Profitable</Badge>;
    } else if (profitNum === 0) {
      return <Badge variant="secondary">Break Even</Badge>;
    } else {
      return <Badge variant="destructive">Loss</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-[#fd7014]" />
            <span>Sales Records</span>
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-[#fd7014]" />
          <span>Sales Records</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('saleDate')}
                    sortDirection={pagination.sortBy === 'saleDate' ? pagination.order : null}
                  >
                    Date
                  </SortableTableHeader>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('sku')}
                    sortDirection={pagination.sortBy === 'sku' ? pagination.order : null}
                  >
                    SKU / Product
                  </SortableTableHeader>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('quantity')}
                    sortDirection={pagination.sortBy === 'quantity' ? pagination.order : null}
                  >
                    Quantity
                  </SortableTableHeader>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('totalRevenue')}
                    sortDirection={pagination.sortBy === 'totalRevenue' ? pagination.order : null}
                  >
                    Revenue
                  </SortableTableHeader>
                  <SortableTableHeader
                    onSort={() => pagination.setSorting('profit')}
                    sortDirection={pagination.sortBy === 'profit' ? pagination.order : null}
                  >
                    Profit
                  </SortableTableHeader>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Marketplace
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale: SaleItem) => (
                  <tr 
                    key={sale.id} 
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-black dark:text-white">
                          {formatDate(sale.saleDate)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm text-black dark:text-white">
                          {sale.sku}
                        </code>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate max-w-[200px]">
                          {sale.productName}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-black dark:text-white">
                          {sale.quantity}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-black dark:text-white">
                        {formatCurrency(sale.totalRevenue)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`font-medium ${
                        parseFloat(sale.profit) >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(sale.profit)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-black dark:text-white">
                        {sale.marketplace || 'Amazon'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getProfitStatus(sale.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {salesData.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No sales records found for this period.
            </div>
          )}

          {salesData.length > 0 && (
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