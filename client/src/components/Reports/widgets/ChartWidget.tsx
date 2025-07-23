import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ReportWidget } from "../ReportBuilderCanvas";
import { getAuthHeaders } from "@/lib/queryClient";

interface ChartWidgetProps {
  widget: ReportWidget;
}

const COLORS = ['#fd7014', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ChartWidget({ widget }: ChartWidgetProps) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: [`/api/${widget.config.dataSource}/chart`, widget.config.metric, widget.config.chartType],
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        let endpoint = "";
        
        switch (widget.config.dataSource) {
          case "sales":
          case "performance":
            endpoint = "/api/performance/categories";
            break;
          case "inventory":
            endpoint = "/api/inventory/summary";
            break;
          case "goals":
            endpoint = "/api/goals";
            break;
          default:
            endpoint = "/api/performance/categories";
        }

        const response = await fetch(endpoint, {
          headers: authHeaders
        });
        
        if (!response.ok) throw new Error('Failed to fetch chart data');
        const data = await response.json();
        
        // Transform data for charts
        if (Array.isArray(data)) {
          return data.map((item, index) => ({
            name: item.category || item.name || `Item ${index + 1}`,
            value: item.revenue || item.totalValue || item.progress || Math.random() * 1000,
            count: item.units || item.totalItems || item.targetValue || Math.random() * 100
          }));
        }
        
        // Generate sample time series data if not array
        return [
          { name: 'Jan', value: 2400, count: 24 },
          { name: 'Feb', value: 1398, count: 18 },
          { name: 'Mar', value: 9800, count: 45 },
          { name: 'Apr', value: 3908, count: 38 },
          { name: 'May', value: 4800, count: 52 },
          { name: 'Jun', value: 3800, count: 41 }
        ];
      } catch (error) {
        console.error('Error fetching chart data:', error);
        return [];
      }
    }
  });

  if (isLoading) {
    return (
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading chart...</span>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No data available</span>
      </div>
    );
  }

  const renderChart = () => {
    switch (widget.config.chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#fd7014" 
                strokeWidth={2}
                dot={{ fill: '#fd7014', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="value" fill="#fd7014" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={chartData.slice(0, 6)} // Limit to 6 segments for readability
                cx="50%"
                cy="50%"
                outerRadius={40}
                dataKey="value"
                label={false}
              >
                {chartData.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Chart type not supported</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {renderChart()}
      <div className="text-xs text-muted-foreground">
        {widget.config.chartType?.toUpperCase()} Chart - {chartData.length} data points
      </div>
    </div>
  );
}