import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { SalesTrendsExplorer } from "@/components/Analytics/SalesTrendsExplorer";
import { SKULeaderboard } from "@/components/Analytics/SKULeaderboard";
import { SalesHistoryTable } from "@/components/Analytics/SalesHistoryTable";
import { SalesHistoryCalendar } from "@/components/Analytics/SalesHistoryCalendar";
import { PerformanceKPIs } from "@/components/Analytics/PerformanceKPIs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, BarChart3, Target, Activity, DollarSign, Users, ShoppingCart, RefreshCw } from "lucide-react";
import PerformanceSyncModal from "@/components/modals/PerformanceSyncModal";

export default function Analytics() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [dateRange, setDateRange] = useState("30d");

  // Fetch performance metrics with real data integration
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/performance/metrics", dateRange],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest(`/api/performance/metrics/${dateRange}`);
      return response.json();
    },
  });

  // Auto-refetch when sync is complete
  useEffect(() => {
    if (!isSyncing && user) {
      queryClient.invalidateQueries({ queryKey: ["/api/performance/metrics"] });
    }
  }, [isSyncing, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d0f13] flex items-center justify-center">
        <div className="text-black dark:text-white">Loading performance data...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  // Use real data when available, fallback to sample data
  const metrics = performanceMetrics || { totalRevenue: 0, totalProfit: 0, totalUnits: 0, conversionRate: 0 };
  const hasRealData = metrics.totalRevenue > 0;

  const handleRecalculateMetrics = async () => {
    try {
      setIsSyncing(true);
      console.log('🔄 Starting performance recalculation...');
      const response = await apiRequest('/api/performance/recalculate', {
        method: 'POST'
      });
      console.log('✅ Recalculation completed successfully');
      // Refetch will happen automatically via useEffect
      setTimeout(() => setIsSyncing(false), 1500);
    } catch (error) {
      console.error('Recalculation error:', error);
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f13] text-black dark:text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-[#fd7014]" />
                  <span>Performance Analytics</span>
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  {hasRealData ? "Showing your real business data" : "Sample data - add inventory and sales to see real metrics"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleRecalculateMetrics}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Refreshing...' : 'Refresh Metrics'}</span>
                </Button>
              </div>
            </div>
          </div>



          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-[#222831]">
              <TabsTrigger value="performance" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Sales History
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Sales Trends Explorer
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Sales History Calendar
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                SKU Leaderboard
              </TabsTrigger>
            </TabsList>


            <TabsContent value="performance">
              <div className="space-y-6">
                {/* Performance Filters & Dynamic KPIs */}
                <PerformanceKPIs onFiltersChange={(filters) => {
                  // Filters will automatically affect the sales history table below
                  console.log('Performance filters changed:', filters);
                }} />
                <SalesHistoryTable />
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <SalesTrendsExplorer />
            </TabsContent>

            <TabsContent value="calendar">
              <SalesHistoryCalendar />
            </TabsContent>

            <TabsContent value="leaderboard">
              <SKULeaderboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      {isSyncing && <PerformanceSyncModal isOpen={isSyncing} />}
    </div>
  );
}