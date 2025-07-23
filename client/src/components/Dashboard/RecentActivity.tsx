import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag, Target, Package, FileUp } from "lucide-react";

interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  details: string;
  metadata?: any;
  created_at: string;
}

export function RecentActivity() {
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["/api/activity-log"],
    enabled: !!user,
    staleTime: 0,
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'sale':
        return <ShoppingBag className="h-4 w-4 text-green-600" />;
      case 'goal_created':
      case 'goal_achieved':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'inventory_update':
        return <Package className="h-4 w-4 text-orange-600" />;
      case 'csv_import':
        return <FileUp className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadge = (action: string) => {
    const badgeConfig = {
      sale: { label: "Sale", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      goal_created: { label: "Goal", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
      goal_achieved: { label: "Achievement", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
      inventory_update: { label: "Inventory", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
      csv_import: { label: "Import", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" }
    };
    
    const config = badgeConfig[action as keyof typeof badgeConfig] || { label: "Activity", className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black dark:text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-[#fd7014]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black dark:text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-[#fd7014]" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No recent activity</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Activity will appear here as you use the platform
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: ActivityLog) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-black dark:text-white truncate">
                      {activity.details}
                    </p>
                    {getActivityBadge(activity.action)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}