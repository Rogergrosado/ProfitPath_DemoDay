import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function GoalProgress() {
  const { data: goals, isLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  if (isLoading) {
    return (
      <Card className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Monthly Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Mock goals for demo - in real app these would come from the API
  const mockGoals = [
    {
      description: "Revenue Target",
      current: 45680,
      target: 50000,
      unit: "$",
    },
    {
      description: "Units Sold",
      current: 2847,
      target: 3000,
      unit: "",
    },
    {
      description: "Profit Margin",
      current: 27,
      target: 30,
      unit: "%",
    },
  ];

  return (
    <Card className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Monthly Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockGoals.map((goal, index) => {
          const percentage = (goal.current / goal.target) * 100;
          return (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">{goal.description}</span>
                <span className="text-[hsl(20,90%,54%)]">
                  {goal.unit === "$" && goal.unit}
                  {goal.current.toLocaleString()}
                  {goal.unit !== "$" && goal.unit} / {goal.unit === "$" && goal.unit}
                  {goal.target.toLocaleString()}
                  {goal.unit !== "$" && goal.unit}
                </span>
              </div>
              <Progress
                value={percentage}
                className="w-full bg-slate-600"
                style={{
                  "--progress-foreground": "hsl(20, 90%, 54%)",
                } as React.CSSProperties}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
