import { useQuery } from "@tanstack/react-query";
import { Trophy, Crown, Award, Medal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrophyCard } from "./TrophyCard";
import { useAuthReady } from "@/hooks/use-auth";

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

export function TrophyRoom() {
  const { user, authReady } = useAuthReady();
  
  const { data: trophies = [], isLoading } = useQuery<TrophyData[]>({
    queryKey: ['/api/trophies'],
    enabled: !!user && authReady,
  });

  const completedTrophies = trophies.filter(t => t.completed);
  const trophiesByTier = {
    platinum: completedTrophies.filter(t => t.trophy.tier === 'platinum'),
    gold: completedTrophies.filter(t => t.trophy.tier === 'gold'),
    silver: completedTrophies.filter(t => t.trophy.tier === 'silver'),
    bronze: completedTrophies.filter(t => t.trophy.tier === 'bronze'),
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const TierSection = ({ tier, title, icon, trophies: tierTrophies }: {
    tier: string;
    title: string;
    icon: React.ReactNode;
    trophies: TrophyData[];
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
        <Badge variant="outline" className="ml-auto">
          {tierTrophies.length} earned
        </Badge>
      </div>
      
      {tierTrophies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tierTrophies
            .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
            .map((trophy) => (
              <TrophyCard key={trophy.trophy.id} data={trophy} />
            ))}
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed">
          <CardDescription>No {tier} trophies earned yet</CardDescription>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Trophy Room
          </h1>
          <p className="text-muted-foreground mt-1">
            Your achievements and milestones ({completedTrophies.length}/31 completed)
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{trophiesByTier.platinum.length}</div>
            <div className="text-xs text-muted-foreground">Platinum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{trophiesByTier.gold.length}</div>
            <div className="text-xs text-muted-foreground">Gold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-500">{trophiesByTier.silver.length}</div>
            <div className="text-xs text-muted-foreground">Silver</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{trophiesByTier.bronze.length}</div>
            <div className="text-xs text-muted-foreground">Bronze</div>
          </div>
        </div>
      </div>

      {/* Platinum Trophies */}
      <TierSection
        tier="platinum"
        title="Platinum Trophies"
        icon={<Crown className="h-6 w-6 text-purple-500" />}
        trophies={trophiesByTier.platinum}
      />

      {/* Gold Trophies */}
      <TierSection
        tier="gold"
        title="Gold Trophies"
        icon={<Trophy className="h-6 w-6 text-yellow-500" />}
        trophies={trophiesByTier.gold}
      />

      {/* Silver Trophies */}
      <TierSection
        tier="silver"
        title="Silver Trophies"
        icon={<Award className="h-6 w-6 text-gray-500" />}
        trophies={trophiesByTier.silver}
      />

      {/* Bronze Trophies */}
      <TierSection
        tier="bronze"
        title="Bronze Trophies"
        icon={<Medal className="h-6 w-6 text-amber-600" />}
        trophies={trophiesByTier.bronze}
      />
    </div>
  );
}