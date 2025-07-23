import { useQuery } from "@tanstack/react-query";
import { Trophy, Crown, Award, Medal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrophyCard } from "./TrophyCard";
import { useAuth } from "@/contexts/AuthContext";

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

const tierNames = {
  bronze: "🥉 Bronze Trophies",
  silver: "🥈 Silver Trophies", 
  gold: "🥇 Gold Trophies",
  platinum: "💎 Platinum Trophy",
};

export function TrophyRoom() {
  const { user, loading } = useAuth();
  
  const { data: trophies = [], isLoading } = useQuery<TrophyData[]>({
    queryKey: ['/api/trophies'],
    enabled: !!user && !loading,
  });

  const completedTrophies = trophies.filter(t => t.completed);
  const grouped = {
    bronze: trophies.filter(t => t.trophy.tier === 'bronze' && t.completed),
    silver: trophies.filter(t => t.trophy.tier === 'silver' && t.completed),
    gold: trophies.filter(t => t.trophy.tier === 'gold' && t.completed),
    platinum: trophies.filter(t => t.trophy.tier === 'platinum' && t.completed),
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-10">
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

  return (
    <div className="p-6 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            🏆 Trophy Room
          </h1>
          <p className="text-muted-foreground mt-1">
            Your achievements and milestones ({completedTrophies.length}/31 completed)
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{grouped.platinum.length}</div>
            <div className="text-xs text-muted-foreground">Platinum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{grouped.gold.length}</div>
            <div className="text-xs text-muted-foreground">Gold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-500">{grouped.silver.length}</div>
            <div className="text-xs text-muted-foreground">Silver</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{grouped.bronze.length}</div>
            <div className="text-xs text-muted-foreground">Bronze</div>
          </div>
        </div>
      </div>

      {Object.keys(grouped).map((tier) =>
        grouped[tier as keyof typeof grouped].length > 0 ? (
          <div key={tier} className="space-y-3">
            <h2 className="text-xl font-semibold">
              {tierNames[tier as keyof typeof tierNames]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {grouped[tier as keyof typeof grouped].map((trophy) => (
                <TrophyCard key={trophy.trophy.id} data={trophy} />
              ))}
            </div>
          </div>
        ) : (
          <div key={tier} className="space-y-3">
            <h2 className="text-xl font-semibold">
              {tierNames[tier as keyof typeof tierNames]}
            </h2>
            <Card className="p-8 text-center border-dashed">
              <CardDescription>No {tier} trophies earned yet</CardDescription>
            </Card>
          </div>
        )
      )}
    </div>
  );
}