import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Edit,
  Archive,
  RotateCcw,
  Trash2
} from "lucide-react";

interface GoalDetailModalProps {
  goal: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDetailModal({ goal, open, onOpenChange }: GoalDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/goals/${goal.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Goal updated successfully",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/goals/${goal.id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      toast({
        title: "Goal deleted successfully",
        description: "The goal has been removed from your system.",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'on_track': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'off_track': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unmet': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      met: { label: "Met ✅", className: "bg-green-500/20 text-green-600 dark:text-green-400" },
      on_track: { label: "On Track 📈", className: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
      off_track: { label: "Off Track ⚠️", className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
      unmet: { label: "Unmet ❌", className: "bg-red-500/20 text-red-600 dark:text-red-400" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.on_track;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatMetricValue = (metric: string, value: number) => {
    switch (metric) {
      case 'revenue':
      case 'profit':
        return `$${Math.round(value).toLocaleString()}`;
      case 'unitsSold':
        return Math.round(value).toLocaleString();
      case 'profitMargin':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'revenue': return 'Revenue';
      case 'unitsSold': return 'Units Sold';
      case 'profit': return 'Profit';
      case 'profitMargin': return 'Profit Margin';
      default: return metric;
    }
  };

  const calculateTimeRemaining = () => {
    const now = new Date();
    const createdAt = new Date(goal.createdAt);
    const periodDays = parseInt(goal.period.replace('d', ''));
    const endDate = new Date(createdAt.getTime() + periodDays * 24 * 60 * 60 * 1000);
    const timeRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      days: timeRemaining,
      endDate: endDate.toLocaleDateString(),
      isExpired: now > endDate
    };
  };

  const timeInfo = calculateTimeRemaining();

  const handleArchive = () => {
    updateMutation.mutate({ isActive: false });
  };

  const handleReactivate = () => {
    updateMutation.mutate({ isActive: true });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-black dark:text-white">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-[#fd7014]" />
              {getMetricLabel(goal.metric)} Goal
            </div>
            {getStatusBadge(goal.status)}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Track progress and manage your business objective
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center text-black dark:text-white">
                {getStatusIcon(goal.status)}
                <span className="ml-2">Progress Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Value</div>
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {formatMetricValue(goal.metric, goal.currentValue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Target Value</div>
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {formatMetricValue(goal.metric, goal.targetValue)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Goal Progress</span>
                  <span className="font-medium text-black dark:text-white">{goal.progress.toFixed(1)}%</span>
                </div>
                <Progress value={goal.progress} className="h-4" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Time Elapsed</div>
                  <div className="text-black dark:text-white">{goal.timeElapsed.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Days Remaining</div>
                  <div className={`font-medium ${timeInfo.isExpired ? 'text-red-500' : 'text-black dark:text-white'}`}>
                    {timeInfo.isExpired ? 'Expired' : `${timeInfo.days} days`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Details */}
          <Card className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Goal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Metric</div>
                  <div className="text-black dark:text-white">{getMetricLabel(goal.metric)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Scope</div>
                  <div className="text-black dark:text-white">
                    {goal.scope === 'global' && 'All products'}
                    {goal.scope === 'category' && `Category: ${goal.targetCategory}`}
                    {goal.scope === 'sku' && `SKU: ${goal.targetSKU}`}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Period</div>
                  <div className="text-black dark:text-white">{goal.period.replace('d', ' days')}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</div>
                  <div className="text-black dark:text-white">{new Date(goal.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {goal.description && (
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</div>
                  <div className="text-black dark:text-white">{goal.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <Card className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {goal.status === 'met' && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="font-medium text-green-800 dark:text-green-300">🎉 Congratulations!</div>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      You've successfully achieved this goal! Your current performance exceeds the target by{' '}
                      {formatMetricValue(goal.metric, goal.currentValue - goal.targetValue)}.
                    </div>
                  </div>
                )}

                {goal.status === 'on_track' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="font-medium text-blue-800 dark:text-blue-300">📈 On Track</div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      Great progress! You're on pace to meet your goal. Keep up the momentum.
                    </div>
                  </div>
                )}

                {goal.status === 'off_track' && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="font-medium text-yellow-800 dark:text-yellow-300">⚠️ Behind Schedule</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">
                      Your progress is behind the expected pace. Consider adjusting your strategy to get back on track.
                    </div>
                  </div>
                )}

                {goal.status === 'unmet' && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="font-medium text-red-800 dark:text-red-300">❌ Goal Not Met</div>
                    <div className="text-sm text-red-700 dark:text-red-400">
                      The time period has ended without reaching the target. Review what worked and what didn't for future goals.
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="font-medium mb-1">Quick Stats:</div>
                  <ul className="space-y-1">
                    <li>• Daily target: {formatMetricValue(goal.metric, goal.targetValue / parseInt(goal.period.replace('d', '')))}</li>
                    <li>• Current daily average: {formatMetricValue(goal.metric, goal.currentValue / Math.max(1, goal.timeElapsed / 100 * parseInt(goal.period.replace('d', ''))))}</li>
                    <li>• Remaining to achieve: {formatMetricValue(goal.metric, Math.max(0, goal.targetValue - goal.currentValue))}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              
              {goal.isActive ? (
                <Button
                  variant="outline"
                  onClick={handleArchive}
                  disabled={updateMutation.isPending}
                  className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleReactivate}
                  disabled={updateMutation.isPending}
                  className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reactivate
                </Button>
              )}
            </div>

            <Button
              onClick={() => onOpenChange(false)}
              className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}