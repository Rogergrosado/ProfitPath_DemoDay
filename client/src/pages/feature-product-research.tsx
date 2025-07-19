import { FeatureTopBarLayout } from "@/components/Layout/FeatureTopBarLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  BarChart3,
  Eye,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Lightbulb,
} from "lucide-react";

export default function FeatureProductResearch() {
  const keyTools = [
    {
      icon: Search,
      title: "Market Research Tools",
      description:
        "Comprehensive product validation with demand scoring, competition analysis, and market trend identification to minimize investment risks.",
    },
    {
      icon: Eye,
      title: "Product Watchlist",
      description:
        "Track potential products in different research stages - from initial idea to ready-to-launch validation with organized status tracking.",
    },
    {
      icon: BarChart3,
      title: "Competition Analysis",
      description:
        "Monitor competitor pricing, review scores, market positioning, and identify gaps in the market for profitable opportunities.",
    },
    {
      icon: DollarSign,
      title: "Profit Calculator",
      description:
        "Estimate potential profits with detailed cost analysis, fee calculations, and revenue projections before making investment decisions.",
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
                <Search className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight mb-6 text-black dark:text-white">
              Product Research
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Validate products before investing with comprehensive market
              analysis. ProfitPath's research tools help you discover profitable
              opportunities, analyze competition, and minimize risks through
              data-driven insights. Research and validate product ideas in an
              organized watchlist before committing to inventory investment.
            </p>
          </div>

          {/* Key Tools Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-black dark:text-white">
              Research & Validation Tools
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

          {/* Research Process */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-[#222831] dark:to-slate-800 rounded-2xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-black dark:text-white">
                  How Product Research Works
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Add to Watchlist
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Track potential products and organize them by research
                        status from idea to validation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Market Analysis
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Analyze demand scores, competition levels, pricing
                        trends, and market opportunities.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Profit Validation
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Calculate potential profits, estimate costs, and
                        validate business viability before investing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Launch Decision
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Make data-driven decisions and promote validated
                        products to active inventory.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-80 bg-gradient-to-br from-[#fd7014]/20 to-orange-600/20 rounded-full flex items-center justify-center">
                    <div className="w-60 h-60 bg-gradient-to-br from-[#fd7014] to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Lightbulb className="h-24 w-24 text-white" />
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute top-1/2 -left-8 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-white" />
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
