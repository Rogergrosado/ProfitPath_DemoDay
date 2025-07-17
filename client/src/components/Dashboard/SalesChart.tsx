import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
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

interface SalesData {
  daily: {
    labels: string[];
    revenue: number[];
    units: number[];
    profit: number[];
  };
  weekly: {
    labels: string[];
    revenue: number[];
    units: number[];
    profit: number[];
  };
  monthly: {
    labels: string[];
    revenue: number[];
    units: number[];
    profit: number[];
  };
}

const salesData: SalesData = {
  daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    revenue: [12500, 15200, 11800, 18400, 16900, 22100, 19800],
    units: [45, 52, 38, 61, 58, 73, 67],
    profit: [3200, 3900, 2850, 4700, 4300, 5650, 5040]
  },
  weekly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    revenue: [89500, 102300, 95200, 118600],
    units: [324, 378, 345, 421],
    profit: [22800, 26100, 24300, 30200]
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    revenue: [345000, 398000, 420000, 389000, 456000, 502000],
    units: [1245, 1432, 1518, 1389, 1634, 1789],
    profit: [88200, 101500, 107100, 99200, 116400, 128000]
  }
};

type TimeFrame = 'daily' | 'weekly' | 'monthly';

export function SalesChart() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');

  const currentData = salesData[timeFrame];

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
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          {/* Chart summary */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-card-foreground">
                ${currentData.revenue.reduce((a, b) => a + b, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Units</p>
              <p className="text-xl font-bold text-card-foreground">
                {currentData.units.reduce((a, b) => a + b, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className="text-xl font-bold text-card-foreground">
                ${currentData.profit.reduce((a, b) => a + b, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}