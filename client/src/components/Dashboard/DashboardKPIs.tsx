import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, TrendingUp, Target } from "lucide-react";

export function DashboardKPIs() {
  const { user } = useAuth();

  // Fetch dashboard KPIs (career-wide aggregates)
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
    enabled: !!user,
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch("/api/dashboard/kpis", {
          headers: authHeaders
        });
        
        if (!response.ok) throw new Error('Failed to fetch dashboard KPIs');
        return response.json();
      } catch (error) {
        console.error('Error fetching dashboard KPIs:', error);
        return {
          overallRevenue: 0,
          overallUnitsSold: 0,
          overallProfitMargin: 0,
          overallConversionRate: 0
        };
      }
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black dark:text-white">
            Overall Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-[#fd7014]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black dark:text-white">
            ${isLoading ? "..." : kpis?.overallRevenue?.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Career total revenue
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black dark:text-white">
            Overall Units Sold
          </CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black dark:text-white">
            {isLoading ? "..." : kpis?.overallUnitsSold?.toLocaleString() || "0"}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total units sold
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black dark:text-white">
            Overall Profit Margin
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black dark:text-white">
            {isLoading ? "..." : `${kpis?.overallProfitMargin?.toFixed(1) || "0.0"}%`}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Career profit margin
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black dark:text-white">
            Overall Conversion Rate
          </CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black dark:text-white">
            {isLoading ? "..." : `${kpis?.overallConversionRate?.toFixed(1) || "0.0"}%`}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Overall conversion rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}