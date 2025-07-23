import { useQuery } from "@tanstack/react-query";
import { Target, CheckCircle, AlertTriangle, Clock, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthReady } from "@/hooks/use-auth";

interface ActiveGoal {
  id: number;
  metric: string;
  scope: string;
  targetValue: number;
  currentValue: number;
  percentComplete: number;
  status: 'Met' | 'On Track' | 'Off Track' | 'Unmet';
  timePeriod: string;
  description: string;
  sku?: string;
  category?: string;
}

export function ActiveGoalTracker() {
  const { user, authReady } = useAuthReady();
  
  const { data: activeGoals = [], isLoading } = useQuery<ActiveGoal[]>({
    queryKey: ['/api/goals/active'],
    enabled: !!user && authReady,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Met': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'On Track': return <Target className="h-4 w-4 text-blue-500" />;
      case 'Off Track': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'Unmet': return <X className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Met': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'On Track': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Off Track': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Unmet': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'revenue' || metric === 'profit') {
      return `$${value.toLocaleString()}`;
    }
    if (metric === 'profit_margin') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const formatMetricName = (metric: string) => {
    return metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatScope = (scope: string, sku?: string, category?: string) => {
    if (scope === 'global') return 'Overall Business';
    if (scope === 'sku' && sku) return `SKU: ${sku}`;
    if (scope === 'category' && category) return `Category: ${category}`;
    return scope;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
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
            Active Goals Progress
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Active Goals Progress
        </CardTitle>
        <CardDescription>
          Real-time tracking of your business objectives
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {activeGoals.map((goal) => (
          <div key={goal.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(goal.status)}
                <h4 className="font-medium">
                  {formatMetricName(goal.metric)} Goal
                </h4>
                <Badge className={getStatusColor(goal.status)}>
                  {goal.status}
                </Badge>
              </div>
              <span className="text-sm font-medium">
                {Math.round(goal.percentComplete)}%
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div>
                <strong>Target:</strong> {formatValue(goal.targetValue, goal.metric)} ({goal.timePeriod})
              </div>
              <div>
                <strong>Scope:</strong> {formatScope(goal.scope, goal.sku, goal.category)}
              </div>
              {goal.description && (
                <div>
                  <strong>Description:</strong> {goal.description}
                </div>
              )}
            </div>
            
            <Progress value={goal.percentComplete} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Current: {formatValue(goal.currentValue, goal.metric)}</span>
              <span>Target: {formatValue(goal.targetValue, goal.metric)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}