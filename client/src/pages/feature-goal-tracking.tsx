import { FeatureTopBarLayout } from "@/components/Layout/FeatureTopBarLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Trophy,
  Calendar,
  BarChart3,
  CheckCircle,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";

export default function FeatureGoalTracking() {
  const keyTools = [
    {
      icon: Target,
      title: "SMART Goal Setting",
      description:
        "Create specific, measurable, achievable, relevant, and time-bound goals for revenue, profit, sales volume, and business growth metrics.",
    },
    {
      icon: BarChart3,
      title: "Automatic Progress Tracking",
      description:
        "Goals update automatically based on real sales data with visual progress indicators, completion percentages, and timeline tracking.",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description:
        "Earn badges and celebrate milestones with detailed achievement history, progress analytics, and goal completion recognition.",
    },
    {
      icon: Calendar,
      title: "Timeline & Deadlines",
      description:
        "Visual timeline management with deadline tracking, milestone notifications, and time-remaining indicators for all active goals.",
    },
  ];

  return (
    <FeatureTopBarLayout>
      <div className="px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#fd7014] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight mb-6 text-black dark:text-white">
              Goal Tracking
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Transform your business aspirations into achievable milestones.
              ProfitPath's goal tracking system helps you set SMART goals,
              monitor progress automatically based on real sales data, and
              celebrate achievements as you grow your Amazon FBA business with
              structured, measurable objectives.
            </p>
          </div>

          {/* Key Tools Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-black dark:text-white">
              Goal Management Tools
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {keyTools.map((tool, index) => (
                <Card
                  key={index}
                  className="bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-[#fd7014]/50 transition-all duration-300 group"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-[#fd7014]/20 rounded-xl flex items-center justify-center group-hover:bg-[#fd7014]/30 transition-colors duration-300">
                        <tool.icon className="h-7 w-7 text-[#fd7014]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">
                          {tool.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Goal Achievement Process */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-[#222831] dark:to-slate-800 rounded-2xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-black dark:text-white">
                  Achievement-Driven Growth
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Set SMART Goals
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Define specific revenue, profit, or sales volume targets
                        with clear deadlines and success criteria.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Automatic Tracking
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Progress updates automatically from your sales data with
                        real-time percentage completion.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Visual Progress
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Monitor progress with visual indicators, timeline views,
                        and milestone celebrations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Achieve & Repeat
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Celebrate achievements, analyze performance, and set new
                        goals for continuous growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-80 bg-gradient-to-br from-[#fd7014]/20 to-orange-600/20 rounded-full flex items-center justify-center">
                    <div className="w-60 h-60 bg-gradient-to-br from-[#fd7014] to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Award className="h-24 w-24 text-white" />
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute top-1/2 -left-8 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FeatureTopBarLayout>
  );
}
