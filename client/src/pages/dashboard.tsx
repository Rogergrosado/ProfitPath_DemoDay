import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { KPISection } from "@/components/Dashboard/KPISection";
import { SalesByCategoryChart } from "@/components/Dashboard/SalesByCategoryChart";
import { GoalProgress } from "@/components/Dashboard/GoalProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, TriangleAlert, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
    <div className="min-h-screen bg-[var(--navy)] text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-slate-400">
              Welcome back, {user.displayName}! Monitor your Amazon FBA business performance
            </p>
          </div>

          {/* KPI Cards */}
          <KPISection />

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SalesByCategoryChart />
            <GoalProgress />
          </div>

          {/* Recent Activity */}
          <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 bg-slate-800 rounded-lg"
                  >
                    <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                      <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{activity.message}</div>
                      <div className="text-xs text-slate-400">
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
