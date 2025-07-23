import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesApiData {
  date: string;
  revenue: number;
  profit: number;  
  units: number;
}

interface DashboardSummaryResponse {
  salesData: SalesApiData[];
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalUnitsSold: number;
  };
}

type TimeFrame = 'daily' | 'weekly' | 'monthly';

export function SalesChart() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
  const { user, loading } = useAuth();

  // Fetch real-time dashboard summary data
  const { data: dashboardData, isLoading } = useQuery<DashboardSummaryResponse>({
    queryKey: ['/api/analytics/dashboard-summary', `?range=${timeFrame}`],
    enabled: !!user && !loading,
  });

  // Transform API data for Chart.js
  const transformDataForChart = (apiData: SalesApiData[]) => {
    if (!apiData || apiData.length === 0) {
      return {
        labels: [],
        revenue: [],
        units: [],
        profit: []
      };
    }

    // Format dates based on timeframe
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      switch (timeFrame) {
        case 'daily':
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        case 'monthly':
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        case 'weekly':
        default:
          return `Week ${Math.ceil(date.getDate() / 7)}`;
      }
    };

    return {
      labels: apiData.map(item => formatDate(item.date)),
      revenue: apiData.map(item => item.revenue),
      units: apiData.map(item => item.units),
      profit: apiData.map(item => item.profit)
    };
  };

  const currentData = transformDataForChart(dashboardData?.salesData || []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, sans-serif',
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      }
    }
  };

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Revenue',
        data: currentData.revenue,
        borderColor: '#fd7014',
        backgroundColor: 'rgba(253, 112, 20, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Profit',
        data: currentData.profit,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.4,
      }
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-card-foreground">Sales Performance</CardTitle>
            </div>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as TimeFrame[]).map((period) => (
                <Button
                  key={period}
                  variant={timeFrame === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeFrame(period)}
                  className={`capitalize ${
                    timeFrame === period 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card text-card-foreground border-border hover:bg-muted'
                  }`}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : currentData.labels.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sales data available for the selected time period.</p>
                <p className="text-sm mt-2">Try adding some sales records to see your performance chart.</p>
              </div>
            </div>
          ) : (
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
          
          {/* Chart summary - use API response data when available */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-card-foreground">
                ${(dashboardData?.summary.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Units</p>
              <p className="text-xl font-bold text-card-foreground">
                {(dashboardData?.summary.totalUnitsSold || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className="text-xl font-bold text-card-foreground">
                ${(dashboardData?.summary.totalProfit || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}