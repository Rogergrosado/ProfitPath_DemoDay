import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuthReady } from "@/hooks/use-auth";
import { Link } from "wouter";

interface ClosestTrophy {
  trophy: {
    id: number;
    name: string;
    description: string;
    metric: string;
    threshold: string;
    tier: string;
  };
  percentComplete: number;
  currentValue: number;
  targetValue: number;
}

export function ClosestTrophies() {
  const { user, authReady } = useAuthReady();
  
  const { data: closestTrophies = [], isLoading } = useQuery<ClosestTrophy[]>({
    queryKey: ['/api/trophies/closest'],
    enabled: !!user && authReady,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Closest to Completion
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

  if (closestTrophies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Closest to Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">All trophies completed!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (value: number, metric: string) => {
    if (metric === 'revenue' || metric === 'profit') {
      return `$${value.toLocaleString()}`;
    }
    if (metric === 'profit_margin') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Closest to Completion
          </CardTitle>
          <Link href="/goals/trophies-progress">
            <Button variant="outline" size="sm">
              Show More
            </Button>
          </Link>
        </div>
        <CardDescription>
          Your highest progress trophies
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {closestTrophies.slice(0, 5).map((item) => (
          <div key={item.trophy.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{item.trophy.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {item.trophy.tier}
                </Badge>
              </div>
              <span className="text-sm font-medium">
                {Math.round(item.percentComplete)}%
              </span>
            </div>
            
            <Progress value={item.percentComplete} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.trophy.description}</span>
              <span>
                {formatValue(item.currentValue, item.trophy.metric)} / {formatValue(item.targetValue, item.trophy.metric)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}