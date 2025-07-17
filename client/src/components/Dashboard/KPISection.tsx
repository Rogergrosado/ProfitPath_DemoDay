import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Package, Percent } from "lucide-react";

export function KPISection() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/performance/metrics"],
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
      title: "Monthly Revenue",
      value: `$${metrics?.totalRevenue?.toLocaleString() || "0"}`,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Net Profit",
      value: `$${metrics?.totalProfit?.toLocaleString() || "0"}`,
      change: "+8.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Units Sold",
      value: metrics?.totalUnits?.toLocaleString() || "0",
      change: "-3.1%",
      changeType: "negative" as const,
      icon: Package,
    },
    {
      title: "Avg Order Value",
      value: `$${metrics?.averageOrderValue?.toFixed(2) || "0.00"}`,
      change: "+2.3%",
      changeType: "positive" as const,
      icon: Percent,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[hsl(20,90%,54%)]/20 rounded-lg flex items-center justify-center">
                <kpi.icon className="h-5 w-5 text-[hsl(20,90%,54%)]" />
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  kpi.changeType === "positive"
                    ? "bg-green-400/20 text-green-400"
                    : "bg-red-400/20 text-red-400"
                }`}
              >
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1 text-white">{kpi.value}</div>
            <div className="text-slate-400 text-sm">{kpi.title}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
