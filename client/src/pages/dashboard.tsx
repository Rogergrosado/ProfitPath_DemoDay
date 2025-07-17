import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { AnimatedKPICard } from "@/components/Dashboard/AnimatedKPICard";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { InventorySnapshot } from "@/components/Dashboard/InventorySnapshot";
import { GoalProgressSection } from "@/components/Dashboard/GoalProgressSection";
import { WhatIfSimulator } from "@/components/Dashboard/WhatIfSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, TriangleAlert, BarChart3, DollarSign, Package, TrendingUp, Users } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

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
            <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.displayName}! Monitor your Amazon FBA business performance
            </p>
          </div>

          {/* KPI Cards with Animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedKPICard
              title="Monthly Revenue"
              value={387500}
              previousValue={342000}
              prefix="$"
              icon={DollarSign}
              iconColor="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              delay={0}
            />
            <AnimatedKPICard
              title="Units Sold"
              value={1543}
              previousValue={1298}
              icon={Package}
              iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              delay={200}
            />
            <AnimatedKPICard
              title="Profit Margin"
              value={23.4}
              previousValue={21.8}
              suffix="%"
              icon={TrendingUp}
              iconColor="bg-primary/20 text-primary"
              delay={400}
            />
            <AnimatedKPICard
              title="Conversion Rate"
              value={3.7}
              previousValue={3.2}
              suffix="%"
              icon={Users}
              iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
              delay={600}
            />
          </div>

          {/* Main Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Sales Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <SalesChart />
            </div>
            
            {/* Inventory Snapshot */}
            <div>
              <InventorySnapshot />
            </div>
          </div>

          {/* Goal Progress and What-If Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GoalProgressSection />
            <WhatIfSimulator />
          </div>

          {/* Recent Activity with Updated Styling */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-card-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                      <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-card-foreground">{activity.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.details} • {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
