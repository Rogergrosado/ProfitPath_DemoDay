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

          {/* Sales Performance Chart */}
          <div className="mb-8">
            <SalesChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Inventory Snapshot */}
            <Card className="bg-card text-card-foreground">
              <InventorySnapshot />
            </Card>

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