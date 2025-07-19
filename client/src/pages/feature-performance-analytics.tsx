import { FeatureTopBarLayout } from "@/components/Layout/FeatureTopBarLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Brain,
  FileText,
  Activity,
  DollarSign,
  PieChart,
  Zap,
} from "lucide-react";

export default function FeaturePerformanceAnalytics() {
  const keyTools = [
    {
      icon: BarChart3,
      title: "Revenue Dashboard",
      description:
        "Real-time revenue tracking with profit calculations, margin analysis, and performance metrics updated automatically from your sales data.",
    },
    {
      icon: Brain,
      title: "Predictive Analytics",
      description:
        "AI-powered forecasting and trend analysis to predict future sales, identify growth opportunities, and optimize business decisions.",
    },
    {
      icon: Activity,
      title: "Sales History Analysis",
      description:
        "Comprehensive sales tracking with detailed transaction history, performance trends, and comparative analysis across time periods.",
    },
    {
      icon: FileText,
      title: "Custom Reports",
      description:
        "Generate detailed performance reports with custom date ranges, filters, and export options for accounting and business analysis.",
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
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight mb-6 text-black dark:text-white">
              Performance Analytics
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Transform your sales data into actionable insights. ProfitPath's
              advanced analytics engine provides comprehensive reporting,
              predictive insights, and real-time KPI tracking to help you
              optimize your Amazon FBA business performance and make data-driven
              decisions for sustainable growth.
            </p>
          </div>

          {/* Key Tools Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-black dark:text-white">
              Analytics & Reporting Tools
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

          {/* Analytics Process */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-[#222831] dark:to-slate-800 rounded-2xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-black dark:text-white">
                  Data-Driven Decision Making
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Data Collection
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Automatically sync and process sales data, inventory
                        movements, and performance metrics.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        AI Analysis
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Advanced algorithms analyze trends, identify patterns,
                        and generate predictive insights.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Visual Reporting
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Interactive dashboards and charts make complex data easy
                        to understand and act upon.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Actionable Insights
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Get specific recommendations to optimize performance,
                        improve margins, and scale your business.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-80 bg-gradient-to-br from-[#fd7014]/20 to-orange-600/20 rounded-full flex items-center justify-center">
                    <div className="w-60 h-60 bg-gradient-to-br from-[#fd7014] to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                      <TrendingUp className="h-24 w-24 text-white" />
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute top-1/2 -left-8 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
