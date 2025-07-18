import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { PredictiveAnalytics } from "@/components/Analytics/PredictiveAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, BarChart3, Target } from "lucide-react";

export default function Analytics() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

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
                <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-[#fd7014]" />
                  <span>Advanced Analytics Hub</span>
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  AI-powered insights, predictive modeling, and business intelligence
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="predictive" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-[#222831]">
              <TabsTrigger value="predictive" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Predictive Analytics
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Performance Metrics
              </TabsTrigger>
              <TabsTrigger value="forecasting" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Demand Forecasting
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Market Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="predictive">
              <PredictiveAnalytics />
            </TabsContent>

            <TabsContent value="performance">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Performance Analytics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Analyze your business performance across all key metrics
                    </p>
                    <Button 
                      onClick={() => setLocation('/dashboard')}
                      className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                    >
                      View Performance Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="forecasting">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Demand Forecasting</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Advanced demand forecasting is integrated into the Predictive Analytics tab
                    </p>
                    <Button 
                      onClick={() => {}}
                      className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                    >
                      Access via Predictive Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Market Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      AI-generated market insights and recommendations
                    </p>
                    <Button 
                      onClick={() => {}}
                      className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                    >
                      View Market Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}