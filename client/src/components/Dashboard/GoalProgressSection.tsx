import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  type: 'revenue' | 'units' | 'profit' | 'conversion';
  priority: 'high' | 'medium' | 'low';
  unit: string;
}

const goalData: Goal[] = [
  {
    id: 1,
    title: "Monthly Revenue Target",
    description: "Achieve $500K in monthly sales",
    target: 500000,
    current: 387500,
    deadline: "Dec 31, 2024",
    type: "revenue",
    priority: "high",
    unit: "$"
  },
  {
    id: 2,
    title: "Units Sold Goal",
    description: "Sell 2,000 units this month",
    target: 2000,
    current: 1543,
    deadline: "Dec 31, 2024",
    type: "units",
    priority: "high",
    unit: " units"
  },
  {
    id: 3,
    title: "Profit Margin",
    description: "Maintain 25% profit margin",
    target: 25,
    current: 23.4,
    deadline: "Dec 31, 2024",
    type: "profit",
    priority: "medium",
    unit: "%"
  },
  {
    id: 4,
    title: "New Product Launch",
    description: "Launch 3 new products",
    target: 3,
    current: 2,
    deadline: "Jan 15, 2025",
    type: "units",
    priority: "medium",
    unit: " products"
  }
];

export function GoalProgressSection() {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-primary';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return value >= 1000000 
        ? `$${(value / 1000000).toFixed(1)}M`
        : value >= 1000 
        ? `$${(value / 1000).toFixed(0)}K`
        : `$${value}`;
    }
    return `${value}${unit}`;
  };

  const completedGoals = goalData.filter(goal => 
    (goal.current / goal.target) * 100 >= 100
  ).length;

  const averageProgress = goalData.reduce((sum, goal) => 
    sum + Math.min((goal.current / goal.target) * 100, 100), 0
  ) / goalData.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-card-foreground">Goal Progress</CardTitle>
            </div>
            <div className="flex gap-2 items-center">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {completedGoals}/{goalData.length} Complete
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Progress Summary */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-card-foreground">
                {Math.round(averageProgress)}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${averageProgress}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Individual Goals */}
          <div className="space-y-4">
            {goalData.map((goal, index) => {
              const percentage = Math.min((goal.current / goal.target) * 100, 100);
              const isCompleted = percentage >= 100;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-card-foreground">
                          {goal.title}
                        </h4>
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            ✓ Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {goal.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {goal.deadline}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-lg font-bold text-card-foreground">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-border rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 * index }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>
                ${Math.round((goalData[0].target - goalData[0].current) / 1000)}K remaining to reach revenue target
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}