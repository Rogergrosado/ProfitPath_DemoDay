import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, Package, TrendingUp, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";

interface PerformanceKPIsProps {
  onFiltersChange?: (filters: any) => void;
}

export function PerformanceKPIs({ onFiltersChange }: PerformanceKPIsProps) {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [category, setCategory] = useState<string>("all");
  const [skuSearch, setSkuSearch] = useState<string>("");
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  // Debounce SKU search to avoid too many API calls
  const debouncedSku = useDebounce(skuSearch, 500);

  // Build filters object
  const filters = {
    startDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    category: category !== "all" ? category : undefined,
    sku: debouncedSku || undefined
  };

  // Fetch performance KPIs with filters
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["/api/performance/kpis", filters],
    enabled: !!user,
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const params = new URLSearchParams();
        
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.category) params.append("category", filters.category);
        if (filters.sku) params.append("sku", filters.sku);

        const response = await fetch(`/api/performance/kpis?${params.toString()}`, {
          headers: authHeaders
        });
        
        if (!response.ok) throw new Error('Failed to fetch performance KPIs');
        return response.json();
      } catch (error) {
        console.error('Error fetching performance KPIs:', error);
        return {
          totalRevenue: 0,
          totalProfit: 0,
          unitsSold: 0,
          avgOrderValue: 0
        };
      }
    }
  });

  // Notify parent component of filter changes
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [JSON.stringify(filters)]);

  const handleClearFilters = () => {
    setDateRange({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    });
    setCategory("all");
    setSkuSearch("");
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Performance Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range - From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">From Date</label>
              <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      setDateRange(prev => ({ ...prev, from: date }));
                      setIsFromOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Range - To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">To Date</label>
              <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => {
                      setDateRange(prev => ({ ...prev, to: date }));
                      setIsToOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="home-garden">Home & Garden</SelectItem>
                  <SelectItem value="sports-outdoors">Sports & Outdoors</SelectItem>
                  <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SKU Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Search by SKU</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter SKU..."
                  value={skuSearch}
                  onChange={(e) => setSkuSearch(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
                <Button onClick={handleClearFilters} variant="outline" size="sm">
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black dark:text-white">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#fd7014]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black dark:text-white">
              ${isLoading ? "..." : kpis?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              From filtered sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black dark:text-white">
              Total Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black dark:text-white">
              ${isLoading ? "..." : kpis?.totalProfit?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Net profit from sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black dark:text-white">
              Units Sold
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black dark:text-white">
              {isLoading ? "..." : kpis?.unitsSold || "0"}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total units sold
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black dark:text-white">
              Avg Order Value
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black dark:text-white">
              ${isLoading ? "..." : kpis?.avgOrderValue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Revenue per order
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}