import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Medal,
  Award,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Gift,
  Lock,
  Unlock,
  CheckCircle
} from "lucide-react";
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'inventory' | 'profit' | 'engagement' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: any;
  points: number;
  requirement: {
    type: string;
    target: number;
    metric: string;
  };
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  secret?: boolean;
}

interface SellerLevel {
  level: number;
  title: string;
  description: string;
  pointsRequired: number;
  benefits: string[];
  color: string;
  icon: any;
}

const SELLER_LEVELS: SellerLevel[] = [
  {
    level: 1,
    title: "Rookie Seller",
    description: "Just getting started",
    pointsRequired: 0,
    benefits: ["Basic dashboard access", "Inventory tracking"],
    color: "bg-gray-500",
    icon: Package
  },
  {
    level: 2,
    title: "Rising Star",
    description: "Making progress",
    pointsRequired: 500,
    benefits: ["Advanced analytics", "Goal tracking", "Export reports"],
    color: "bg-blue-500",
    icon: Star
  },
  {
    level: 3,
    title: "Power Seller",
    description: "Consistent performance",
    pointsRequired: 1500,
    benefits: ["Predictive analytics", "Custom alerts", "Priority support"],
    color: "bg-purple-500",
    icon: Zap
  },
  {
    level: 4,
    title: "Elite Trader",
    description: "Top performer",
    pointsRequired: 3000,
    benefits: ["AI insights", "Market analysis", "VIP features"],
    color: "bg-orange-500",
    icon: Crown
  },
  {
    level: 5,
    title: "Amazon Legend",
    description: "Master of the marketplace",
    pointsRequired: 5000,
    benefits: ["Everything unlocked", "Exclusive tools", "Direct consultation"],
    color: "bg-yellow-500",
    icon: Trophy
  }
];

const ACHIEVEMENTS: Achievement[] = [
  // Sales Achievements
  {
    id: 'first-sale',
    title: 'First Sale',
    description: 'Made your first sale on the platform',
    category: 'sales',
    tier: 'bronze',
    icon: DollarSign,
    points: 50,
    requirement: { type: 'sales_count', target: 1, metric: 'total_sales' },
    progress: 0,
    unlocked: false
  },
  {
    id: 'sales-100',
    title: 'Century Club',
    description: 'Reached 100 total sales',
    category: 'sales',
    tier: 'silver',
    icon: TrendingUp,
    points: 200,
    requirement: { type: 'sales_count', target: 100, metric: 'total_sales' },
    progress: 0,
    unlocked: false
  },
  {
    id: 'revenue-10k',
    title: 'Revenue Milestone',
    description: 'Generated $10,000 in total revenue',
    category: 'sales',
    tier: 'gold',
    icon: Medal,
    points: 500,
    requirement: { type: 'revenue', target: 10000, metric: 'total_revenue' },
    progress: 0,
    unlocked: false
  },
  {
    id: 'profit-5k',
    title: 'Profit Master',
    description: 'Achieved $5,000 in total profit',
    category: 'profit',
    tier: 'gold',
    icon: Crown,
    points: 400,
    requirement: { type: 'profit', target: 5000, metric: 'total_profit' },
    progress: 0,
    unlocked: false
  },
  // Inventory Achievements
  {
    id: 'inventory-25',
    title: 'Stock Builder',
    description: 'Maintain 25+ products in inventory',
    category: 'inventory',
    tier: 'bronze',
    icon: Package,
    points: 100,
    requirement: { type: 'inventory_count', target: 25, metric: 'active_products' },
    progress: 0,
    unlocked: false
  },
  {
    id: 'zero-stockouts',
    title: 'Never Out',
    description: 'No stockouts for 30 consecutive days',
    category: 'inventory',
    tier: 'platinum',
    icon: Target,
    points: 750,
    requirement: { type: 'days_without_stockout', target: 30, metric: 'stockout_streak' },
    progress: 0,
    unlocked: false
  },
  // Engagement Achievements
  {
    id: 'daily-login-7',
    title: 'Week Warrior',
    description: 'Log in for 7 consecutive days',
    category: 'engagement',
    tier: 'bronze',
    icon: Calendar,
    points: 75,
    requirement: { type: 'login_streak', target: 7, metric: 'consecutive_days' },
    progress: 0,
    unlocked: false
  },
  {
    id: 'goals-completed-5',
    title: 'Goal Getter',
    description: 'Complete 5 business goals',
    category: 'milestone',
    tier: 'silver',
    icon: CheckCircle,
    points: 300,
    requirement: { type: 'goals_completed', target: 5, metric: 'completed_goals' },
    progress: 0,
    unlocked: false
  },
  // Secret Achievements
  {
    id: 'perfect-month',
    title: 'Flawless Victory',
    description: 'Complete a month with 100% goal achievement',
    category: 'milestone',
    tier: 'diamond',
    icon: Award,
    points: 1000,
    requirement: { type: 'perfect_month', target: 1, metric: 'perfect_months' },
    progress: 0,
    unlocked: false,
    secret: true
  }
];

const TIER_COLORS = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-blue-500',
  diamond: 'bg-purple-500'
};

export function AchievementSystem() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales"],
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals"],
  });

  // Calculate user progress and achievements
  const { userProgress, unlockedAchievements, totalPoints, currentLevel } = useMemo(() => {
    const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + (sale.totalRevenue || 0), 0);
    const totalProfit = salesData.reduce((sum: number, sale: any) => sum + (sale.profit || 0), 0);
    const totalSales = salesData.length;
    const activeProducts = inventory.length;
    const completedGoals = goals.filter((goal: any) => goal.status === 'completed').length;

    const progress = {
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      total_sales: totalSales,
      active_products: activeProducts,
      completed_goals: completedGoals,
      consecutive_days: 5, // Mock data
      stockout_streak: 12, // Mock data
      perfect_months: totalProfit > 2000 ? 1 : 0
    };

    // Calculate achievement progress
    const updatedAchievements = ACHIEVEMENTS.map(achievement => {
      const currentValue = progress[achievement.requirement.metric as keyof typeof progress] || 0;
      const progressPercent = Math.min((currentValue / achievement.requirement.target) * 100, 100);
      const isUnlocked = currentValue >= achievement.requirement.target;

      return {
        ...achievement,
        progress: progressPercent,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked ? new Date() : undefined
      };
    });

    const unlockedCount = updatedAchievements.filter(a => a.unlocked).length;
    const points = updatedAchievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    // Determine current level
    const level = SELLER_LEVELS.findLast(level => points >= level.pointsRequired) || SELLER_LEVELS[0];

    return {
      userProgress: progress,
      unlockedAchievements: updatedAchievements,
      totalPoints: points,
      currentLevel: level
    };
  }, [salesData, inventory, goals]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const nextLevel = SELLER_LEVELS.find(level => level.pointsRequired > totalPoints);
  const progressToNext = nextLevel ? 
    ((totalPoints - currentLevel.pointsRequired) / (nextLevel.pointsRequired - currentLevel.pointsRequired)) * 100 : 100;

  const achievementsByCategory = unlockedAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const recentUnlocked = unlockedAchievements
    .filter(a => a.unlocked)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Seller Level Progress */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 ${currentLevel.color}/10`} />
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${currentLevel.color} text-white`}>
              <currentLevel.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{currentLevel.title}</div>
              <div className="text-muted-foreground">{currentLevel.description}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-muted-foreground">Level {currentLevel.level}</div>
              <div className="text-2xl font-bold">{totalPoints.toLocaleString()} pts</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextLevel ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextLevel.title}</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <div className="text-sm text-muted-foreground">
                {(nextLevel.pointsRequired - totalPoints).toLocaleString()} points needed
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
              <div className="font-bold text-lg">Maximum Level Reached!</div>
              <div className="text-muted-foreground">You've mastered the marketplace</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUnlocked.map(achievement => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`p-2 rounded-full ${TIER_COLORS[achievement.tier]} text-white`}>
                    <achievement.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">+{achievement.points}</div>
                    <div className="text-xs text-muted-foreground">pts</div>
                  </div>
                </div>
              ))}
              {recentUnlocked.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Complete actions to unlock achievements</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievement Progress */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Achievement Progress</span>
                <Badge variant="secondary">
                  {unlockedAchievements.filter(a => a.unlocked).length} / {unlockedAchievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements
                  .filter(a => !a.secret || a.unlocked)
                  .map(achievement => (
                  <div
                    key={achievement.id}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                      ${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-muted/30'}
                    `}
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`
                        p-2 rounded-full text-white
                        ${achievement.unlocked ? TIER_COLORS[achievement.tier] : 'bg-gray-400'}
                      `}>
                        {achievement.unlocked ? (
                          <achievement.icon className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{achievement.title}</span>
                          <Badge className={`${TIER_COLORS[achievement.tier]} text-white text-xs`}>
                            {achievement.tier.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        {!achievement.unlocked && (
                          <div className="space-y-1">
                            <Progress value={achievement.progress} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {Math.round(achievement.progress)}% complete
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {achievement.points} points
                          </span>
                          {achievement.unlocked && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <Dialog 
          open={!!selectedAchievement} 
          onOpenChange={() => setSelectedAchievement(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${TIER_COLORS[selectedAchievement.tier]} text-white`}>
                  <selectedAchievement.icon className="h-6 w-6" />
                </div>
                <div>
                  <div>{selectedAchievement.title}</div>
                  <Badge className={`${TIER_COLORS[selectedAchievement.tier]} text-white mt-1`}>
                    {selectedAchievement.tier.toUpperCase()} TIER
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedAchievement.description}</p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Category</div>
                    <div className="font-medium capitalize">{selectedAchievement.category}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Points Reward</div>
                    <div className="font-medium">{selectedAchievement.points} points</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Requirement</div>
                    <div className="font-medium">
                      {selectedAchievement.requirement.target.toLocaleString()} {selectedAchievement.requirement.metric.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className={`font-medium ${selectedAchievement.unlocked ? 'text-green-600' : 'text-orange-600'}`}>
                      {selectedAchievement.unlocked ? 'Unlocked' : 'In Progress'}
                    </div>
                  </div>
                </div>
              </div>

              {!selectedAchievement.unlocked && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(selectedAchievement.progress)}%</span>
                  </div>
                  <Progress value={selectedAchievement.progress} />
                </div>
              )}

              {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">Achievement Unlocked!</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedAchievement.unlockedAt.toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-xl shadow-2xl animate-bounce">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <div className="text-2xl font-bold text-center">Achievement Unlocked!</div>
          </div>
        </div>
      )}
    </div>
  );
}