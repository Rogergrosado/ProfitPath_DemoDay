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
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SalesTrendsData {
  date: string;
  revenue: number;
  unitsSold: number;
  profit: number;
  avgOrderValue: number;
}

export function SalesTrendsExplorer() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [category, setCategory] = useState<string>("all");
  const [skuSearch, setSkuSearch] = useState<string>("");
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  // Chart toggles
  const [visibleLines, setVisibleLines] = useState({
    revenue: true,
    unitsSold: true,
    profit: false,
    avgOrderValue: false
  });

  // Debounce SKU search
  const debouncedSku = useDebounce(skuSearch, 500);

  // Build filters object
  const filters = {
    startDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    category: category !== "all" ? category : undefined,
    sku: debouncedSku || undefined
  };

  // Fetch sales trends data
  const { data: trendsData = [], isLoading } = useQuery({
    queryKey: ["/api/analytics/sales-trend", filters],
    enabled: !!user,
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const params = new URLSearchParams();
        
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.category) params.append("category", filters.category);
        if (filters.sku) params.append("sku", filters.sku);

        console.log('🔍 Fetching sales trends with filters:', filters);
        console.log('🔍 API URL:', `/api/analytics/sales-trend?${params.toString()}`);

        const response = await fetch(`/api/analytics/sales-trend?${params.toString()}`, {
          headers: authHeaders
        });
        
        if (!response.ok) throw new Error('Failed to fetch sales trends');
        const data = await response.json();
        console.log('📊 Sales trends data received:', data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('❌ Error fetching sales trends:', error);
        return [];
      }
    }
  });

  const handleClearFilters = () => {
    setDateRange({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    });
    setCategory("all");
    setSkuSearch("");
  };

  const toggleLine = (lineKey: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Sales Trends Filters</span>
          </CardTitle>
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

            {/* SKU Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">SKU Search</label>
              <Input
                placeholder="Search by SKU..."
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
                className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
              className="text-gray-600 dark:text-gray-400"
            >
              Clear Filters
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {trendsData.length} data points
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Toggles */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Chart Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="revenue"
                checked={visibleLines.revenue}
                onCheckedChange={() => toggleLine('revenue')}
              />
              <label htmlFor="revenue" className="text-sm font-medium text-black dark:text-white">
                📊 Revenue
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="units"
                checked={visibleLines.unitsSold}
                onCheckedChange={() => toggleLine('unitsSold')}
              />
              <label htmlFor="units" className="text-sm font-medium text-black dark:text-white">
                📦 Units Sold
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="profit"
                checked={visibleLines.profit}
                onCheckedChange={() => toggleLine('profit')}
              />
              <label htmlFor="profit" className="text-sm font-medium text-black dark:text-white">
                💵 Profit
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aov"
                checked={visibleLines.avgOrderValue}
                onCheckedChange={() => toggleLine('avgOrderValue')}
              />
              <label htmlFor="aov" className="text-sm font-medium text-black dark:text-white">
                📈 Avg Order Value
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Sales Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400">Loading chart data...</div>
            </div>
          ) : !trendsData || trendsData.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-2">No sales trends data available</div>
                <div className="text-sm text-gray-400">Add sales data to see trends visualization</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                
                {visibleLines.revenue && (
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                )}
                
                {visibleLines.unitsSold && (
                  <Line 
                    type="monotone" 
                    dataKey="unitsSold" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Units Sold"
                  />
                )}
                
                {visibleLines.profit && (
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Profit ($)"
                  />
                )}
                
                {visibleLines.avgOrderValue && (
                  <Line 
                    type="monotone" 
                    dataKey="avgOrderValue" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Avg Order Value ($)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}