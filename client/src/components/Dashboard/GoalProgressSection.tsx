import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Goal {
  id: number;
  metric: string;
  targetValue: string;
  currentValue: number;
  progressPercentage: number;
  status: string;
  period: string;
  scope: string;
  sku?: string;
  category?: string;
  description?: string;
  createdAt: string;
}

interface KPIs {
  overallRevenue: number;
  overallUnitsSold: number;
  overallProfit: number;
  overallProfitMargin: number;
}

export function GoalProgressSection() {
  const { user, loading } = useAuth();

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ['/api/goals/with-progress'],
    enabled: !!user && !loading,
  });

  const { data: kpis, isLoading: kpisLoading } = useQuery<KPIs>({
    queryKey: ['/api/dashboard/kpis'],
    enabled: !!user && !loading,
  });

  const activeGoals = goals.filter(goal => goal.status !== 'met' && goal.status !== 'unmet');

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-primary';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on_track':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'off_track':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'at_risk':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'unmet':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'revenue':
      case 'profit':
        return `$${value.toLocaleString()}`;
      case 'unitsSold':
        return `${value.toLocaleString()} units`;
      case 'profitMargin':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const getMetricTitle = (metric: string) => {
    switch (metric) {
      case 'revenue': return 'Revenue Goal';
      case 'profit': return 'Profit Goal';
      case 'unitsSold': return 'Units Sold Goal';
      case 'profitMargin': return 'Profit Margin Goal';
      default: return 'Goal';
    }
  };

  if (goalsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No active goals set</p>
            <p className="text-sm text-muted-foreground">Create your first goal to track progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedGoals = activeGoals.filter(goal => goal.status === 'met').length;
  const averageProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, goal) => sum + goal.progressPercentage, 0) / activeGoals.length 
    : 0;

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
              <CardTitle className="text-card-foreground">Goal Progress Overview</CardTitle>
            </div>
            <div className="flex gap-2 items-center">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {completedGoals}/{activeGoals.length} Complete
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
            {activeGoals.slice(0, 4).map((goal, index) => {
              const percentage = goal.progressPercentage;
              const isCompleted = goal.status === 'met';
              
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
                          {getMetricTitle(goal.metric)}
                        </h4>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            ✓ Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {goal.description || `${goal.scope} goal for ${goal.period}`}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Period: {goal.period}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{formatValue(goal.currentValue, goal.metric)} / {formatValue(Number(goal.targetValue), goal.metric)}</span>
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

          {/* Quick Summary */}
          {activeGoals.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>
                  {activeGoals.length} active goal{activeGoals.length > 1 ? 's' : ''} in progress
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}