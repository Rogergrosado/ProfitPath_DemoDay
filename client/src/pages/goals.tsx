import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementSystem } from "@/components/Goals/AchievementSystem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Target, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  DollarSign,
  Package,
  Calendar,
  BarChart3,
  Trophy,
  Archive
} from "lucide-react";
import { CreateGoalModal } from "@/components/Goals/CreateGoalModal";
import { GoalDetailModal } from "@/components/Goals/GoalDetailModal";

export default function Goals() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch user profile for personalization
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });

  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales"],
    enabled: !!user,
  });

  const { data: inventoryData = [] } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d0f13] flex items-center justify-center">
        <div className="text-black dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  // Calculate goal progress based on real data
  const calculateGoalProgress = (goal: any) => {
    const now = new Date();
    const createdAt = new Date(goal.createdAt);
    const periodDays = parseInt(goal.period.replace('d', ''));
    const endDate = new Date(createdAt.getTime() + periodDays * 24 * 60 * 60 * 1000);
    
    let currentValue = 0;
    
    switch (goal.metric) {
      case 'revenue':
        if (goal.scope === 'global') {
          currentValue = salesData.reduce((sum: number, sale: any) => 
            sum + (parseFloat(sale.totalPrice) || 0), 0);
        } else if (goal.scope === 'category') {
          currentValue = salesData
            .filter((sale: any) => sale.inventory?.category === goal.targetCategory)
            .reduce((sum: number, sale: any) => sum + (parseFloat(sale.totalPrice) || 0), 0);
        }
        break;
      
      case 'unitsSold':
        if (goal.scope === 'global') {
          currentValue = salesData.reduce((sum: number, sale: any) => 
            sum + (sale.quantity || 0), 0);
        } else if (goal.scope === 'sku' && goal.targetSKU) {
          currentValue = salesData
            .filter((sale: any) => sale.inventory?.sku === goal.targetSKU)
            .reduce((sum: number, sale: any) => sum + (sale.quantity || 0), 0);
        }
        break;
      
      case 'profit':
        currentValue = salesData.reduce((sum: number, sale: any) => {
          const revenue = parseFloat(sale.totalPrice) || 0;
          const cost = (sale.quantity || 0) * (parseFloat(sale.inventory?.costPrice) || 0);
          return sum + (revenue - cost);
        }, 0);
        break;
      
      case 'profitMargin':
        const totalRevenue = salesData.reduce((sum: number, sale: any) => 
          sum + (parseFloat(sale.totalPrice) || 0), 0);
        const totalCost = salesData.reduce((sum: number, sale: any) => 
          sum + ((sale.quantity || 0) * (parseFloat(sale.inventory?.costPrice) || 0)), 0);
        currentValue = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
        break;
    }
    
    const progress = Math.min((currentValue / goal.targetValue) * 100, 100);
    const timeElapsed = Math.min((now.getTime() - createdAt.getTime()) / (endDate.getTime() - createdAt.getTime()), 1);
    
    let status = 'on_track';
    if (progress >= 100) {
      status = 'met';
    } else if (now > endDate) {
      status = 'unmet';
    } else if (progress < timeElapsed * 100 * 0.8) {
      status = 'off_track';
    }
    
    return { currentValue, progress, status, timeElapsed: timeElapsed * 100 };
  };

  const goalsWithProgress = goals.map((goal: any) => ({
    ...goal,
    ...calculateGoalProgress(goal)
  }));

  const activeGoals = goalsWithProgress.filter((goal: any) => goal.isActive);
  const completedGoals = goalsWithProgress.filter((goal: any) => !goal.isActive || goal.status === 'met' || goal.status === 'unmet');

  const filteredGoals = (activeTab === "active" ? activeGoals : completedGoals).filter((goal: any) => {
    const metricMatch = selectedMetric === "all" || goal.metric === selectedMetric;
    const periodMatch = selectedPeriod === "all" || goal.period === selectedPeriod;
    return metricMatch && periodMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met': return 'bg-green-500';
      case 'on_track': return 'bg-blue-500';
      case 'off_track': return 'bg-yellow-500';
      case 'unmet': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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

  // Goal status summary for dashboard
  const goalSummary = {
    total: activeGoals.length,
    met: activeGoals.filter(g => g.status === 'met').length,
    onTrack: activeGoals.filter(g => g.status === 'on_track').length,
    offTrack: activeGoals.filter(g => g.status === 'off_track').length,
    unmet: activeGoals.filter(g => g.status === 'unmet').length,
  };

  const handleGoalClick = (goal: any) => {
    setSelectedGoal(goal);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f13] text-black dark:text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {userProfile?.businessName ? `${userProfile.businessName} Goals & Targets` : 'Goals & Targets'}
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  {userProfile?.businessName 
                    ? `Set, track, and achieve ${userProfile.businessName} business objectives`
                    : "Set, track, and achieve your business objectives"
                  }
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </div>

          {/* Goal Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-[#fd7014] mx-auto mb-2" />
                <div className="text-2xl font-bold text-black dark:text-white">{goalSummary.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Goals</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{goalSummary.met}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Met</div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{goalSummary.onTrack}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">On Track</div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{goalSummary.offTrack}</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Off Track</div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{goalSummary.unmet}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Unmet</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Tabs */}
          <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-gray-100 dark:bg-slate-700">
                    <TabsTrigger value="active" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                      Active Goals
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                      Goal History
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex space-x-4">
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-40 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                      <SelectValue placeholder="Metric" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                      <SelectItem value="all">All Metrics</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="unitsSold">Units Sold</SelectItem>
                      <SelectItem value="profit">Profit</SelectItem>
                      <SelectItem value="profitMargin">Profit Margin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                      <SelectItem value="all">All Periods</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

              {/* Goals List */}
              <div className="space-y-4">
            {filteredGoals.length === 0 ? (
              <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {activeTab === "active" ? "No active goals" : "No completed goals"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {activeTab === "active" 
                      ? "Create your first goal to start tracking your business objectives." 
                      : "Complete some goals to see your achievement history here."
                    }
                  </p>
                  {activeTab === "active" && (
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredGoals.map((goal: any) => (
                <Card 
                  key={goal.id} 
                  className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleGoalClick(goal)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(goal.status)}
                          <h3 className="text-lg font-semibold text-black dark:text-white">
                            {goal.metric === 'revenue' && 'Revenue Goal'}
                            {goal.metric === 'unitsSold' && 'Sales Volume Goal'}
                            {goal.metric === 'profit' && 'Profit Goal'}
                            {goal.metric === 'profitMargin' && 'Profit Margin Goal'}
                          </h3>
                          {getStatusBadge(goal.status)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Target: {formatMetricValue(goal.metric, goal.targetValue)}
                          {goal.scope !== 'global' && (
                            <span className="ml-2">
                              ({goal.scope === 'category' ? `Category: ${goal.targetCategory}` : `SKU: ${goal.targetSKU}`})
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {goal.period} period
                          </div>
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Current: {formatMetricValue(goal.metric, goal.currentValue)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-black dark:text-white">{goal.progress.toFixed(1)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={goal.progress} className="h-3" />
                        <div 
                          className="absolute top-0 h-3 bg-gray-300 dark:bg-gray-600 opacity-50 rounded-full"
                          style={{ width: `${goal.timeElapsed}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Time elapsed: {goal.timeElapsed.toFixed(1)}%</span>
                        <span>
                          {goal.progress >= 100 ? "🎉 Goal achieved!" : 
                           goal.progress >= goal.timeElapsed * 0.8 ? "📈 On track" : 
                           "⚠️ Behind schedule"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Modals */}
          {showCreateModal && (
            <CreateGoalModal
              open={showCreateModal}
              onOpenChange={setShowCreateModal}
            />
          )}

          {showDetailModal && selectedGoal && (
            <GoalDetailModal
              goal={selectedGoal}
              open={showDetailModal}
              onOpenChange={setShowDetailModal}
            />
          )}
        </div>
      </main>
    </div>
  );
}