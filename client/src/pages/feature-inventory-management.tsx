import { FeatureTopBarLayout } from "@/components/Layout/FeatureTopBarLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Upload,
  AlertTriangle,
  Calendar,
  BarChart3,
  RefreshCw,
  TrendingUp,
  Boxes,
} from "lucide-react";

export default function FeatureInventoryManagement() {
  const keyTools = [
    {
      icon: Package,
      title: "Manual Inventory Entry",
      description:
        "Add products individually with detailed tracking including SKU, costs, selling prices, stock levels, and reorder points for precise control.",
    },
    {
      icon: Upload,
      title: "CSV Bulk Import",
      description:
        "Import large inventory datasets from spreadsheets or supplier systems with intelligent parsing and data validation for efficient setup.",
    },
    {
      icon: AlertTriangle,
      title: "Smart Stock Alerts",
      description:
        "Automated notifications for low stock, out-of-stock, and reorder triggers based on sales velocity and customizable thresholds.",
    },
    {
      icon: Calendar,
      title: "Reorder Calendar",
      description:
        "Visual calendar showing optimal reorder dates, lead times, and inventory forecasting to prevent stockouts and optimize cash flow.",
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
                <Package className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight mb-6 text-black dark:text-white">
              Inventory Management
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Never run out of stock again. ProfitPath's intelligent inventory
              system tracks stock levels, predicts reorder dates, and helps
              maintain optimal inventory levels for maximum profitability.
              Manage your Amazon FBA inventory with real-time tracking,
              automated alerts, and smart forecasting.
            </p>
          </div>

          {/* Key Tools Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-black dark:text-white">
              Inventory Management Tools
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

          {/* Inventory Workflow */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-[#222831] dark:to-slate-800 rounded-2xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-black dark:text-white">
                  Smart Inventory Workflow
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Add Inventory
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Import via CSV or add products manually with complete
                        details including costs, prices, and stock levels.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Track Stock Levels
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Monitor real-time inventory with automatic updates from
                        sales data and manual adjustments.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Smart Alerts
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Receive notifications when products reach reorder points
                        or go out of stock.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        Optimize Reorders
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Use forecasting and calendar view to plan optimal
                        reorder timing and quantities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-80 bg-gradient-to-br from-[#fd7014]/20 to-orange-600/20 rounded-full flex items-center justify-center">
                    <div className="w-60 h-60 bg-gradient-to-br from-[#fd7014] to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Boxes className="h-24 w-24 text-white" />
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute top-1/2 -left-8 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <RefreshCw className="h-6 w-6 text-white" />
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
