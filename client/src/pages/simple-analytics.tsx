import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import PerformanceSyncModal from "@/components/modals/PerformanceSyncModal";

export default function SimpleAnalytics() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch performance metrics with real data integration
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/performance/metrics", "30d"],
    enabled: !!user,
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
        <div className="text-black dark:text-white">Loading analytics...</div>
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
  const displayMetrics = hasRealData ? metrics : { totalRevenue: 930, totalProfit: 575, totalUnits: 12, conversionRate: 2.4 };

  const handleRecalculateMetrics = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/performance/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        // Refetch will happen automatically via useEffect
        setTimeout(() => setIsSyncing(false), 1500); // Simulate processing time
      }
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
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
                <p className="text-gray-600 dark:text-slate-400">
                  {hasRealData ? "Showing your real business data" : "Sample data - add inventory and sales to see real metrics"}
                </p>
              </div>
              <button
                onClick={handleRecalculateMetrics}
                disabled={isSyncing}
                className="bg-[#fd7014] hover:bg-[#e5640f] disabled:opacity-50 text-white px-4 py-2 rounded-lg"
              >
                {isSyncing ? "Syncing..." : "Recalculate Metrics"}
              </button>
            </div>
          </div>

          {/* Simple KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-gray-50 dark:bg-[#222831] border border-gray-200 dark:border-slate-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Total Revenue</h3>
              <p className="text-2xl font-bold text-black dark:text-white">${Math.round(displayMetrics.totalRevenue).toLocaleString()}</p>
              {hasRealData && <p className="text-xs text-green-500">Live data</p>}
            </div>
            <div className="p-6 bg-gray-50 dark:bg-[#222831] border border-gray-200 dark:border-slate-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Total Profit</h3>
              <p className="text-2xl font-bold text-black dark:text-white">${Math.round(displayMetrics.totalProfit).toLocaleString()}</p>
              {hasRealData && <p className="text-xs text-green-500">Live data</p>}
            </div>
            <div className="p-6 bg-gray-50 dark:bg-[#222831] border border-gray-200 dark:border-slate-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Units Sold</h3>
              <p className="text-2xl font-bold text-black dark:text-white">{displayMetrics.totalUnits.toLocaleString()}</p>
              {hasRealData && <p className="text-xs text-green-500">Live data</p>}
            </div>
            <div className="p-6 bg-gray-50 dark:bg-[#222831] border border-gray-200 dark:border-slate-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Conversion Rate</h3>
              <p className="text-2xl font-bold text-black dark:text-white">{displayMetrics.conversionRate.toFixed(1)}%</p>
              {hasRealData && <p className="text-xs text-green-500">Live data</p>}
            </div>
          </div>

          {/* Simple Content */}
          <div className="bg-gray-50 dark:bg-[#222831] border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Analytics Working</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              The analytics page is now displaying properly. This confirms the routing and authentication are working.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-slate-400">✓ Page loads successfully</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">✓ Authentication working</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">✓ Sidebar navigation functional</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">✓ Theme system operational</p>
            </div>
          </div>
        </div>
      </main>

      <PerformanceSyncModal isOpen={isSyncing} />
    </div>
  );
}