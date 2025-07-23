import { Trophy, Award, Crown, Medal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TrophyData {
  trophy: {
    id: number;
    name: string;
    description: string;
    metric: string;
    threshold: string;
    tier: string;
  };
  completed: boolean;
  percentComplete: number;
  earnedAt: Date | null;
}

interface TrophyCardProps {
  data: TrophyData;
  showProgress?: boolean;
}

export function TrophyCard({ data, showProgress = false }: TrophyCardProps) {
  const { trophy, completed, percentComplete, earnedAt } = data;
  
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Medal className="h-5 w-5 text-amber-600" />;
      case 'silver': return <Award className="h-5 w-5 text-gray-500" />;
      case 'gold': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'platinum': return <Crown className="h-5 w-5 text-purple-500" />;
      default: return <Medal className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${completed ? 'ring-2 ring-green-200 dark:ring-green-800' : 'opacity-75'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTierIcon(trophy.tier)}
            <Badge className={getTierColor(trophy.tier)}>
              {trophy.tier.toUpperCase()}
            </Badge>
          </div>
          {completed && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              ✓ Completed
            </Badge>
          )}
        </div>
        <CardTitle className={`text-lg ${completed ? 'text-green-700 dark:text-green-300' : ''}`}>
          {trophy.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {trophy.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showProgress && !completed && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(percentComplete)}%</span>
            </div>
            <Progress value={percentComplete} className="h-2" />
          </div>
        )}
        
        {completed && earnedAt && (
          <div className="text-sm text-muted-foreground">
            Earned on {formatDate(earnedAt)}
          </div>
        )}
        
        {!completed && (
          <div className="text-sm text-muted-foreground">
            Target: {Number(trophy.threshold).toLocaleString()} {trophy.metric.replace('_', ' ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}