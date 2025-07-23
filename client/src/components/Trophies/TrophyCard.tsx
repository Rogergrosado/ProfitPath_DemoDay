import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const TrophyBadge = ({ tier, name, unlocked }: { tier: string; name: string; unlocked: boolean }) => {
  const tierStyles = {
    bronze: 'bg-[#cd7f32] text-white',
    silver: 'bg-[#c0c0c0] text-black',
    gold: 'bg-[#ffd700] text-black',
    platinum: 'bg-[#e5e4e2] text-black border-2 border-blue-300',
  };

  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-md ${tierStyles[tier as keyof typeof tierStyles]} ${!unlocked && 'opacity-40 grayscale'}`}>
      <span className="text-lg">{icons[tier as keyof typeof icons]}</span>
      <span className="text-sm font-semibold">{name}</span>
      {!unlocked && <span className="ml-auto text-xs italic">Locked</span>}
    </div>
  );
};

export function TrophyCard({ data, showProgress = false }: TrophyCardProps) {
  const { trophy, completed, percentComplete, earnedAt } = data;

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className={`bg-card p-4 rounded-lg shadow-md transition-all hover:scale-[1.02] ${!completed ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-3 px-0 pt-0">
        <TrophyBadge tier={trophy.tier} name={trophy.name} unlocked={completed} />
        <CardDescription className="text-sm mt-2 text-muted-foreground">
          {trophy.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-0 pb-0">
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
          <div className="text-xs text-green-400">
            Unlocked: {formatDate(earnedAt)}
          </div>
        )}
        
        {!completed && (
          <div className="text-xs text-muted-foreground">
            Target: {Number(trophy.threshold).toLocaleString()} {trophy.metric.replace('_', ' ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}