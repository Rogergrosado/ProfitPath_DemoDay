import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Percent } from "lucide-react";

export function GoalTracker() {
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-2 w-full mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Mock goals for demo - in real app these would come from the API
  const goalCategories = [
    {
      title: "Revenue Goals",
      icon: DollarSign,
      iconColor: "text-green-400",
      goals: [
        {
          description: "Monthly Revenue",
          current: 45680,
          target: 50000,
          unit: "$",
          status: "on_track",
        },
      ],
    },
    {
      title: "Growth Goals",
      icon: TrendingUp,
      iconColor: "text-blue-400",
      goals: [
        {
          description: "Units Sold Growth",
          current: 8.2,
          target: 15,
          unit: "%",
          status: "behind",
        },
      ],
    },
    {
      title: "Efficiency Goals",
      icon: Percent,
      iconColor: "text-purple-400",
      goals: [
        {
          description: "Profit Margin",
          current: 27,
          target: 25,
          unit: "%",
          status: "achieved",
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-500/20 text-green-400";
      case "on_track":
        return "bg-green-500/20 text-green-400";
      case "behind":
        return "bg-yellow-500/20 text-yellow-400";
      case "at_risk":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "achieved":
        return "Achieved";
      case "on_track":
        return "On Track";
      case "behind":
        return "Behind";
      case "at_risk":
        return "At Risk";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {goalCategories.map((category) => (
        <Card key={category.title} className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-white">
              <category.icon className={`h-5 w-5 ${category.iconColor} mr-2`} />
              {category.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.goals.map((goal, index) => {
              const percentage = Math.min((goal.current / goal.target) * 100, 100);
              const progressColor = 
                goal.status === "achieved" || goal.status === "on_track" ? "hsl(142, 76%, 36%)" :
                goal.status === "behind" ? "hsl(48, 96%, 53%)" : "hsl(0, 84%, 60%)";

              return (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">{goal.description}</span>
                    <Badge className={getStatusColor(goal.status)}>
                      {getStatusLabel(goal.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      {goal.unit === "$" && goal.unit}
                      {goal.current.toLocaleString()}
                      {goal.unit !== "$" && goal.unit} / {goal.unit === "$" && goal.unit}
                      {goal.target.toLocaleString()}
                      {goal.unit !== "$" && goal.unit}
                    </span>
                    <span className="text-[hsl(20,90%,54%)]">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    className="w-full bg-slate-600"
                    style={{
                      "--progress-foreground": progressColor,
                    } as React.CSSProperties}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
