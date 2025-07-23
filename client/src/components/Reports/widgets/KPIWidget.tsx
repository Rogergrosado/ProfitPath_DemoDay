import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Target } from "lucide-react";
import { ReportWidget } from "../ReportBuilderCanvas";
import { getAuthHeaders } from "@/lib/queryClient";

interface KPIWidgetProps {
  widget: ReportWidget;
}

export function KPIWidget({ widget }: KPIWidgetProps) {
  const { data: kpiData, isLoading } = useQuery({
    queryKey: [`/api/${widget.config.dataSource}/kpi`, widget.config.metric],
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        let endpoint = "";
        
        switch (widget.config.dataSource) {
          case "sales":
          case "performance":
            endpoint = "/api/performance/kpis";
            break;
          case "inventory":
            endpoint = "/api/inventory/summary";
            break;
          case "goals":
            endpoint = "/api/goals";
            break;
          default:
            endpoint = "/api/performance/kpis";
        }

        const response = await fetch(endpoint, {
          headers: authHeaders
        });
        
        if (!response.ok) throw new Error('Failed to fetch KPI data');
        return response.json();
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        return null;
      }
    }
  });

  const getKPIValue = () => {
    if (!kpiData || isLoading) return { value: "Loading...", change: "", icon: DollarSign };

    switch (widget.config.metric) {
      case "revenue":
        return {
          value: `$${kpiData.totalRevenue?.toLocaleString() || "0"}`,
          change: "+12.5%",
          icon: DollarSign,
          color: "text-green-500"
        };
      case "profit":
        return {
          value: `$${kpiData.totalProfit?.toLocaleString() || "0"}`,
          change: "+8.2%",
          icon: TrendingUp,
          color: "text-blue-500"
        };
      case "units":
        return {
          value: kpiData.unitsSold?.toLocaleString() || kpiData.totalItems?.toLocaleString() || "0",
          change: "+15.7%",
          icon: Package,
          color: "text-purple-500"
        };
      case "orders":
        return {
          value: kpiData.totalOrders?.toLocaleString() || "0",
          change: "+6.3%",
          icon: ShoppingCart,
          color: "text-orange-500"
        };
      default:
        return {
          value: "N/A",
          change: "0%",
          icon: Target,
          color: "text-gray-500"
        };
    }
  };

  const kpiInfo = getKPIValue();
  const IconComponent = kpiInfo.icon;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded mb-1"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
          <IconComponent className={`h-4 w-4 ${kpiInfo.color}`} />
        </div>
        <div className="flex items-center text-xs text-green-500">
          <TrendingUp className="h-3 w-3 mr-1" />
          {kpiInfo.change}
        </div>
      </div>
      <div>
        <div className="text-lg font-bold">{kpiInfo.value}</div>
        <div className="text-xs text-muted-foreground">
          {widget.config.timeframe || "Last 30 days"}
        </div>
      </div>
    </div>
  );
}