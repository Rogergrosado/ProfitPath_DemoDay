import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { PredictiveAnalytics } from "@/components/Analytics/PredictiveAnalytics";
import { SalesHistoryTable } from "@/components/Analytics/SalesHistoryTable";
import { SalesHistoryCalendar } from "@/components/Analytics/SalesHistoryCalendar";
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

          {/* Performance Metrics KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      ${isNaN(metrics.totalRevenue) ? '0.00' : metrics.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Profit</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      ${isNaN(metrics.totalProfit) ? '0.00' : metrics.totalProfit.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Units Sold</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {isNaN(metrics.totalUnits) ? '0' : metrics.totalUnits}
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {isNaN(metrics.conversionRate) ? '0.0' : metrics.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-[#222831]">
              <TabsTrigger value="performance" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Sales History
              </TabsTrigger>
              <TabsTrigger value="predictive" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Predictive Analytics
              </TabsTrigger>
              <TabsTrigger value="forecasting" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Sales History Calendar
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Market Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <div className="space-y-6">
                <SalesHistoryTable />
              </div>
            </TabsContent>

            <TabsContent value="predictive">
              <PredictiveAnalytics />
            </TabsContent>

            <TabsContent value="forecasting">
              <SalesHistoryCalendar />
            </TabsContent>

            <TabsContent value="insights">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Market Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      AI-generated market insights and recommendations
                    </p>
                    <Button 
                      onClick={() => {}}
                      className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                    >
                      View Market Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      {isSyncing && <PerformanceSyncModal isOpen={isSyncing} />}
    </div>
  );
}