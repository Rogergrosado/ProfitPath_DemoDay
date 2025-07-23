import { useQuery } from "@tanstack/react-query";
import { Target, Trophy, TrendingUp, Medal, Award, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthReady } from "@/hooks/use-auth";

interface TrophyProgress {
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

export function TrophyProgress() {
  const { user, authReady } = useAuthReady();
  
  const { data: allTrophies = [], isLoading: loadingAll } = useQuery<TrophyProgress[]>({
    queryKey: ['/api/trophies'],
    enabled: !!user && authReady,
  });

  const { data: closestTrophies = [], isLoading: loadingClosest } = useQuery<ClosestTrophy[]>({
    queryKey: ['/api/trophies/closest', { limit: 20 }],
    enabled: !!user && authReady,
  });

  const incompleteTrophies = allTrophies.filter(t => !t.completed && t.trophy.tier !== 'platinum');
  const trophiesByTier = {
    bronze: incompleteTrophies.filter(t => t.trophy.tier === 'bronze'),
    silver: incompleteTrophies.filter(t => t.trophy.tier === 'silver'),
    gold: incompleteTrophies.filter(t => t.trophy.tier === 'gold'),
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

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Medal className="h-4 w-4 text-amber-600" />;
      case 'silver': return <Award className="h-4 w-4 text-gray-500" />;
      case 'gold': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'platinum': return <Crown className="h-4 w-4 text-purple-500" />;
      default: return <Medal className="h-4 w-4 text-gray-400" />;
    }
  };

  const TrophyProgressCard = ({ item, showCurrentValue = false }: { 
    item: TrophyProgress | ClosestTrophy; 
    showCurrentValue?: boolean;
  }) => {
    const isClosest = 'currentValue' in item;
    const progress = item.percentComplete;
    
    return (
      <Card key={item.trophy.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTierIcon(item.trophy.tier)}
              <Badge variant="outline" className="text-xs">
                {item.trophy.tier.toUpperCase()}
              </Badge>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <CardTitle className="text-base">{item.trophy.name}</CardTitle>
          <CardDescription className="text-sm">
            {item.trophy.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <Progress value={progress} className="h-2" />
          
          {showCurrentValue && isClosest && (
            <div className="text-xs text-muted-foreground text-right">
              {formatValue(item.currentValue, item.trophy.metric)} / {formatValue(item.targetValue, item.trophy.metric)}
            </div>
          )}
          
          {!showCurrentValue && (
            <div className="text-xs text-muted-foreground text-right">
              Target: {formatValue(Number(item.trophy.threshold), item.trophy.metric)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loadingAll || loadingClosest) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Target className="h-6 w-6" />
          Trophy Progress
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your progress toward earning new trophies
        </p>
      </div>

      <Tabs defaultValue="closest" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="closest">Closest ({closestTrophies.length})</TabsTrigger>
          <TabsTrigger value="bronze">Bronze ({trophiesByTier.bronze.length})</TabsTrigger>
          <TabsTrigger value="silver">Silver ({trophiesByTier.silver.length})</TabsTrigger>
          <TabsTrigger value="gold">Gold ({trophiesByTier.gold.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="closest" className="space-y-4">
          {closestTrophies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {closestTrophies.map((item) => (
                <TrophyProgressCard key={item.trophy.id} item={item} showCurrentValue />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <CardDescription>All available trophies completed!</CardDescription>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bronze" className="space-y-4">
          {trophiesByTier.bronze.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trophiesByTier.bronze
                .sort((a, b) => b.percentComplete - a.percentComplete)
                .map((item) => (
                  <TrophyProgressCard key={item.trophy.id} item={item} />
                ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <CardDescription>All bronze trophies completed!</CardDescription>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="silver" className="space-y-4">
          {trophiesByTier.silver.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trophiesByTier.silver
                .sort((a, b) => b.percentComplete - a.percentComplete)
                .map((item) => (
                  <TrophyProgressCard key={item.trophy.id} item={item} />
                ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <CardDescription>All silver trophies completed!</CardDescription>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gold" className="space-y-4">
          {trophiesByTier.gold.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trophiesByTier.gold
                .sort((a, b) => b.percentComplete - a.percentComplete)
                .map((item) => (
                  <TrophyProgressCard key={item.trophy.id} item={item} />
                ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <CardDescription>All gold trophies completed!</CardDescription>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}