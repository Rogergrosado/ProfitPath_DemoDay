import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Package, BarChart3, Target, FileText } from "lucide-react";
import { useLocation } from "wouter";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    onClose();
    setLocation("/products");
  };

  const features = [
    {
      icon: Package,
      title: "Product Watchlist",
      description: "Research and validate products before adding to inventory"
    },
    {
      icon: BarChart3,
      title: "Inventory Management",
      description: "Track stock levels, reorder points, and product performance"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set revenue, profit, and sales targets with real-time progress"
    },
    {
      icon: FileText,
      title: "Advanced Reports",
      description: "Export detailed analytics and performance insights"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-black dark:text-white">
            Welcome to ProfitPath, {userName}! 🎉
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-slate-400 text-lg">
            Your comprehensive Amazon FBA business intelligence dashboard is ready to help you grow your business.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-50 dark:bg-[#2d3748] border-gray-200 dark:border-slate-600">
                <CardContent className="p-4 flex items-start space-x-3">
                  <div className="bg-[#fd7014]/10 p-2 rounded-lg">
                    <feature.icon className="h-5 w-5 text-[#fd7014]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black dark:text-white text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Start Guide */}
          <Card className="bg-gradient-to-r from-[#fd7014]/5 to-orange-100/5 dark:from-[#fd7014]/10 dark:to-orange-900/10 border-[#fd7014]/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-black dark:text-white mb-3 flex items-center">
                <Plus className="h-5 w-5 text-[#fd7014] mr-2" />
                Quick Start: Add Your First Product
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">
                Start by adding products to your watchlist for research and validation. 
                Once validated, promote them to your active inventory to begin tracking sales and performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-[#fd7014] hover:bg-[#e5640f] text-white flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Product
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-[#fd7014] text-[#fd7014] hover:bg-[#fd7014]/10"
                >
                  Explore Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Flow */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-slate-500">
              Flow: Watchlist → Inventory → Sales Data → Goals & Analytics → Reports
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}