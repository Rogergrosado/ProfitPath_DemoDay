import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Download, TrendingUp, DollarSign, Package, RefreshCw, AlertCircle, History } from "lucide-react";
import { apiRequest, getAuthHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthReady } from "@/hooks/useAuthReady";
import { format } from "date-fns";

interface SalesHistoryTableProps {
  className?: string;
}

export function SalesHistoryTable({ className }: SalesHistoryTableProps) {
  const [dateRange, setDateRange] = useState("30d");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [skuFilter, setSkuFilter] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const authReady = useAuthReady();

  // Get date range boundaries based on selection
  const getDateRangeBoundaries = (range: string) => {
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return { startDate, endDate: now };
  };

  const { startDate, endDate } = getDateRangeBoundaries(dateRange);

  const { data: salesHistory = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/sales/history", dateRange, startDate.toISOString(), endDate.toISOString()],
    enabled: !!user && authReady,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the data
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("startDate", startDate.toISOString());
      params.append("endDate", endDate.toISOString());
      
      console.log(`🔄 [Performance] Fetching sales history with params:`, { 
        dateRange, 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });
      
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/sales/history?${params}`, {
        headers: authHeaders,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📦 [Performance] Sales history data received (${Array.isArray(data) ? data.length : 0} entries):`, data);
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: salesMetrics } = useQuery({
    queryKey: ["/api/performance/kpis", dateRange],
    queryFn: async () => {
      const response = await apiRequest(`/api/performance/kpis`);
      return response.json();
    },
  });

  const recalculateMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting performance recalculation...');
      const response = await apiRequest("/api/performance/recalculate", {
        method: "POST"
      });
      console.log('✅ Recalculation completed successfully');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Performance Recalculated",
        description: "All metrics have been updated successfully",
      });
      
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: (error: any) => {
      toast({
        title: "Recalculation Failed",
        description: error.message || "Failed to recalculate performance metrics",
        variant: "destructive",
      });
    },
  });

  const handleManualRefresh = async () => {
    console.log("🔄 [Performance] Manual refresh triggered for Sales History");
    await refetch();
  };

  // Filter sales based on category and SKU
  const filteredSales = salesHistory.filter((sale: any) => {
    const categoryMatch = categoryFilter === "all" || sale.category === categoryFilter;
    const skuMatch = !skuFilter || sale.sku.toLowerCase().includes(skuFilter.toLowerCase());
    return categoryMatch && skuMatch;
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadCSV = () => {
    const headers = ['Date', 'SKU', 'Product Name', 'Category', 'Units Sold', 'Unit Price', 'Total Revenue', 'Profit', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredSales.map((sale: any) => [
        new Date(sale.saleDate).toISOString().split('T')[0],
        sale.sku,
        `"${sale.productName || sale.sku}"`,
        sale.category || 'N/A',
        sale.quantitySold || sale.quantity,
        sale.unitPrice,
        sale.totalRevenue,
        sale.profit || '0.00',
        `"${sale.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_history_${dateRange}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#fd7014]" />
              Sales History & Analytics Log
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
        <CardContent className="p-6">
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Sales History - Error
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
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

  return (
    <div className={className}>
      {/* Sales Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(salesMetrics?.totalRevenue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Profit</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(salesMetrics?.totalProfit || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Units Sold</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {salesMetrics?.unitsSold || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {formatCurrency(salesMetrics?.avgOrderValue || 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#fd7014]" />
              Sales History & Analytics Log
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 hover:bg-[#fd7014] hover:text-white transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => recalculateMutation.mutate()}
                disabled={recalculateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                <RefreshCw className={`w-4 h-4 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
                {recalculateMutation.isPending ? 'Recalculating...' : 'Recalc KPIs'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="home-garden">Home & Garden</SelectItem>
                  <SelectItem value="sports-outdoors">Sports & Outdoors</SelectItem>
                  <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Filter by SKU..."
                value={skuFilter}
                onChange={(e) => setSkuFilter(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          {/* Sales Table */}
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Sales History Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No sales have been recorded for the selected {dateRange} period
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                Record your first sale to see analytics data here
              </p>
              <Button 
                variant="outline" 
                onClick={handleManualRefresh}
                className="hover:bg-[#fd7014] hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">SKU</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Units</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Unit Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Profit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSales.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {format(new Date(sale.saleDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="outline">{sale.sku}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {sale.productName || 'Unknown Product'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="secondary">{sale.category || 'N/A'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {sale.quantitySold || sale.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        ${parseFloat(sale.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-semibold">
                        ${parseFloat(sale.totalRevenue || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-400 font-semibold">
                        ${parseFloat(sale.profit || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {sale.notes || '-'}
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