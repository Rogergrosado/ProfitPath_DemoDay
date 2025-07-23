import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ShoppingCart, DollarSign, Percent, ArrowUp, ArrowDown } from "lucide-react";

export function PerformanceKPICards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/performance/kpis"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${metrics?.totalRevenue?.toLocaleString() || "0"}`,
      change: "+15.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      title: "Units Sold",
      value: metrics?.unitsSold?.toLocaleString() || "0",
      change: "+8.7%",
      changeType: "positive" as const,
      icon: ShoppingCart,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Avg Order Value",
      value: `$${metrics?.avgOrderValue?.toFixed(2) || "0.00"}`,
      change: "-2.1%",
      changeType: "negative" as const,
      icon: DollarSign,
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
    {
      title: "Conversion Rate",
      value: "3.2%", // Mock data - would be calculated from actual data
      change: "+3.4%",
      changeType: "positive" as const,
      icon: Percent,
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div className={`flex items-center text-sm ${
                kpi.changeType === "positive" ? "text-green-400" : "text-red-400"
              }`}>
                {kpi.changeType === "positive" ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                <span>{kpi.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold mb-1 text-white">{kpi.value}</div>
            <div className="text-slate-400 text-sm">{kpi.title}</div>
            <div className="text-xs text-slate-500 mt-1">vs. last period</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
