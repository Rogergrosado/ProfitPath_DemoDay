import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { getAuthHeaders } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthReady } from "@/hooks/useAuthReady";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, TrendingUp, DollarSign, Package, RefreshCw, AlertCircle } from "lucide-react";

interface SalesHistoryTableProps {
  inventorySku?: string;
  startDate?: Date;
  endDate?: Date;
}

export function SalesHistoryTable({ inventorySku, startDate, endDate }: SalesHistoryTableProps) {
  const { user } = useAuth();
  const authReady = useAuthReady();
  const queryClient = useQueryClient();

  const { data: salesHistory, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/sales/history", inventorySku, startDate?.toISOString(), endDate?.toISOString()],
    enabled: !!user && authReady,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the data
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      if (inventorySku) params.append("sku", inventorySku);
      
      console.log(`🔄 Fetching sales history with params:`, { 
        inventorySku, 
        startDate: startDate?.toISOString(), 
        endDate: endDate?.toISOString() 
      });
      
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/sales/history?${params}`, {
        headers: authHeaders,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📦 Sales history data received (${Array.isArray(data) ? data.length : 0} entries):`, data);
      return Array.isArray(data) ? data : [];
    },
  });

  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered for Sales History");
    await refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#fd7014]" />
              Sales History
              {inventorySku && (
                <Badge variant="outline" className="ml-2">
                  {inventorySku}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm" 
              disabled={true}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Sales History - Error
              {inventorySku && (
                <Badge variant="outline" className="ml-2">
                  {inventorySku}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 hover:bg-[#fd7014] hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 dark:text-red-400">
            Failed to load sales history: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const safeHistory = Array.isArray(salesHistory) ? salesHistory : [];
  
  const totalRevenue = safeHistory.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.totalRevenue || 0), 0);
  const totalUnits = safeHistory.reduce((sum: number, sale: any) => 
    sum + (sale.quantitySold || 0), 0);
  const totalProfit = safeHistory.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.profit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              From {safeHistory.length} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Units Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalUnits}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total quantity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Net profit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#fd7014]" />
              Detailed Sales History
              {inventorySku && (
                <Badge variant="outline" className="ml-2">
                  {inventorySku}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 hover:bg-[#fd7014] hover:text-white transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safeHistory && safeHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeHistory.map((sale: any) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {format(new Date(sale.saleDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.productName || 'Unknown Product'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.sku}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {sale.quantitySold}
                      </TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(sale.unitPrice || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                        ${parseFloat(sale.totalRevenue || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-purple-600 dark:text-purple-400 font-semibold">
                        ${parseFloat(sale.profit || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {sale.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Sales History Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {inventorySku 
                  ? `No sales recorded for SKU: ${inventorySku}` 
                  : 'No sales have been recorded yet'
                }
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}