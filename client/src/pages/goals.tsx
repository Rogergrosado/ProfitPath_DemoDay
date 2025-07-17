import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { GoalTracker } from "@/components/Goals/GoalTracker";
import { SetGoalForm } from "@/components/Goals/SetGoalForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Clock, Calendar } from "lucide-react";

export default function Goals() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const goalTimeline = [
    {
      id: 1,
      title: "Q1 Revenue Target",
      description: "Achieved $150,000 in quarterly revenue",
      status: "completed",
      date: "March 2024",
      icon: Check,
      iconBg: "bg-green-500",
    },
    {
      id: 2,
      title: "Expand Product Line",
      description: "Launch 5 new products by end of Q2",
      status: "in_progress",
      date: "Due June 2024",
      icon: Clock,
      iconBg: "bg-[var(--orange-primary)]",
    },
    {
      id: 3,
      title: "Market Expansion",
      description: "Enter European markets",
      status: "planned",
      date: "Target: Q3 2024",
      icon: Calendar,
      iconBg: "bg-slate-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-[var(--orange-primary)]/20 text-[var(--orange-primary)]">In Progress</Badge>;
      case "planned":
        return <Badge className="bg-slate-700 text-slate-400">Planned</Badge>;
      default:
        return <Badge className="bg-slate-700 text-slate-400">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--navy)] text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Business Goals</h1>
                <p className="text-slate-400">Set and track your performance targets</p>
              </div>
              <Button className="bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </div>

          {/* Goal Categories */}
          <GoalTracker />

          {/* Goal Timeline */}
          <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)] mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Goal Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-600"></div>
                <div className="space-y-8">
                  {goalTimeline.map((goal) => (
                    <div key={goal.id} className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${goal.iconBg} rounded-full flex items-center justify-center relative z-10`}>
                        <goal.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-white">{goal.title}</h4>
                          {getStatusBadge(goal.status)}
                        </div>
                        <p className="text-slate-400 text-sm">{goal.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{goal.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Set New Goal Form */}
          <SetGoalForm />
        </div>
      </main>
    </div>
  );
}
