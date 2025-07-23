import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useValidateSession } from "@/hooks/useValidateSession";
import { useAuthReady } from "@/hooks/useAuthReady";
import { useAuthDebug } from "@/hooks/useAuthDebug";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { AnimatedKPICard } from "@/components/Dashboard/AnimatedKPICard";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { InventorySnapshot } from "@/components/Dashboard/InventorySnapshot";
import { DashboardKPIs } from "@/components/Dashboard/DashboardKPIs";
import { InventoryDataIntegration } from "@/components/Dashboard/InventoryDataIntegration";
import { GoalProgressSection } from "@/components/Dashboard/GoalProgressSection";
import { WhatIfSimulator } from "@/components/Dashboard/WhatIfSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, TriangleAlert, BarChart3, DollarSign, Package, TrendingUp, Users } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { isValid, loading: sessionLoading } = useValidateSession();
  const authReady = useAuthReady();
  
  // Debug hook to catch UID mismatches
  useAuthDebug();
  
  // Fetch user profile for personalization - wait for auth to be ready
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!user && authReady,
  });

  // Fetch real performance metrics data - wait for auth to be ready
  const { data: performanceMetrics } = useQuery({
    queryKey: ["/api/performance/metrics", "30d"],
    enabled: !!user && authReady,
  });

  // Fetch inventory summary data - wait for auth to be ready
  const { data: inventorySummary } = useQuery({
    queryKey: ["/api/inventory/summary"],
    enabled: !!user && authReady,
  });

  // Fetch sales data for trends - wait for auth to be ready
  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales", "30d"],
    enabled: !!user && authReady,
  });

  if (loading || sessionLoading || !authReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">
          {loading && "Loading user..."}
          {sessionLoading && "Validating session..."}
          {!authReady && user && "Refreshing auth token..."}
        </div>
      </div>
    );
  }

  if (!user || !isValid) {
    return null; // useValidateSession will handle redirect
  }

  // Calculate real values from data - show real data when available
  const metrics = performanceMetrics || { totalRevenue: 0, totalProfit: 0, totalUnits: 0, conversionRate: 0 };
  const inventory = inventorySummary || { totalItems: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0 };
  
  // Calculate profit margin from real data  
  const profitMargin = metrics.totalRevenue > 0 ? (metrics.totalProfit / metrics.totalRevenue) * 100 : 0;
  
  // Show sample data if no real data exists
  const hasRealData = metrics.totalRevenue > 0 || inventory.totalItems > 0;
  const displayMetrics = hasRealData ? metrics : { totalRevenue: 930, totalProfit: 575, totalUnits: 12, conversionRate: 2.4 };
  const displayInventory = hasRealData ? inventory : { totalItems: 5, totalValue: 24760, lowStockItems: 3, outOfStockItems: 1 };
  const displayProfitMargin = hasRealData ? profitMargin : 23.4;

  const recentActivities = [
    {
      id: 1,
      type: "restock",
      message: 'Product "Wireless Earbuds Pro" restocked',
      details: "Added 500 units",
      time: "2 hours ago",
      icon: ArrowUp,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      id: 2,
      type: "alert",
      message: 'Low stock alert for "Fitness Tracker X1"',
      details: "Only 23 units remaining",
      time: "4 hours ago",
      icon: TriangleAlert,
      iconBg: "bg-orange-500/20",
      iconColor: "text-[var(--orange-primary)]",
    },
    {
      id: 3,
      type: "report",
      message: "Weekly report generated",
      details: "Performance summary ready",
      time: "6 hours ago",
      icon: BarChart3,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-60 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Welcome back, {userProfile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground">
              {userProfile?.businessName 
                ? `${userProfile.businessName} business overview - Monitor your Amazon FBA performance` 
                : "Monitor your Amazon FBA business performance"
              }
            </p>
          </div>

          {/* KPI Cards with Animation - Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedKPICard
              title="Monthly Revenue"
              value={Math.round(displayMetrics.totalRevenue)}
              previousValue={Math.round(displayMetrics.totalRevenue * 0.85)} // Estimate 15% growth
              prefix="$"
              icon={DollarSign}
              iconColor="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              delay={0}
            />
            <AnimatedKPICard
              title="Units Sold"
              value={displayMetrics.totalUnits}
              previousValue={Math.round(displayMetrics.totalUnits * 0.82)} // Estimate 18% growth
              icon={Package}
              iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              delay={200}
            />
            <AnimatedKPICard
              title="Profit Margin"
              value={Number(displayProfitMargin.toFixed(1))}
              previousValue={Number((displayProfitMargin * 0.93).toFixed(1))} // Estimate 7% improvement
              suffix="%"
              icon={TrendingUp}
              iconColor="bg-primary/20 text-primary"
              delay={400}
            />
            <AnimatedKPICard
              title="Conversion Rate"
              value={Number(displayMetrics.conversionRate.toFixed(1))}
              previousValue={Number((displayMetrics.conversionRate * 0.88).toFixed(1))} // Estimate 12% improvement
              suffix="%"
              icon={Users}
              iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
              delay={600}
            />
          </div>

          {/* Sales Performance Chart */}
          <div className="mb-8">
            <SalesChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Real-Time Inventory Data Integration */}
            <InventoryDataIntegration />

            {/* Goal Progress */}
            <Card className="bg-card text-card-foreground">
              <GoalProgressSection />
            </Card>

            {/* Recent Activity Feed */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`${activity.iconBg} p-2 rounded-lg`}>
                        <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What-If Simulator - Branded as Demo for Future Forecasting */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-card-foreground flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Future Forecasting Demo
                <Badge className="ml-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs">
                  Coming Soon
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WhatIfSimulator />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}