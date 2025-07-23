import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, BarChart3, Target, TrendingUp, FileText, ChevronRight } from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [, setLocation] = useLocation();
  const { completeWelcome } = useOnboarding();

  const handleGetStarted = () => {
    completeWelcome();
    setLocation("/products");
    onClose();
  };

  const features = [
    {
      icon: Search,
      title: "Product Research",
      description: "Start by adding products to your watchlist for research and validation"
    },
    {
      icon: Package,
      title: "Inventory Management", 
      description: "Promote validated products to active inventory with stock tracking"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track sales, profits, and growth with detailed reporting (unlocks after sales data)"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor business objectives with visual progress (unlocks after sales data)"
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "AI-powered insights and predictive analytics (unlocks after sales data)"
    },
    {
      icon: FileText,
      title: "Custom Reports",
      description: "Build and export custom business intelligence reports"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700" aria-describedby="welcome-description">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-3xl font-bold text-black dark:text-white">
            Welcome to ProfitPath, {userName}! 🎉
          </DialogTitle>
          <DialogDescription id="welcome-description" className="text-gray-600 dark:text-slate-400 text-lg">
            Your comprehensive Amazon FBA business intelligence dashboard is ready to help you grow your business.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progressive Journey */}
          <div className="bg-gradient-to-r from-[#fd7014]/10 to-blue-500/10 rounded-lg p-6 border border-[#fd7014]/20">
            <h3 className="text-xl font-semibold text-black dark:text-white mb-3">Your ProfitPath Journey</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#fd7014] text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <div className="font-medium text-black dark:text-white">Start with Products</div>
                  <div className="text-gray-600 dark:text-slate-400">Add items to your research watchlist</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <div className="font-medium text-black dark:text-white">Build Inventory</div>
                  <div className="text-gray-600 dark:text-slate-400">Promote products to active inventory</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <div className="font-medium text-black dark:text-white">Track Performance</div>
                  <div className="text-gray-600 dark:text-slate-400">Add sales data to unlock analytics</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const isLocked = index >= 2; // Lock features 2+ until sales data
              return (
                <Card key={index} className={`border ${isLocked ? 'opacity-60' : ''} bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isLocked ? 'bg-gray-100 dark:bg-gray-700' : 'bg-[#fd7014]/10'}`}>
                        <feature.icon className={`h-5 w-5 ${isLocked ? 'text-gray-400' : 'text-[#fd7014]'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-black dark:text-white text-sm mb-1">
                          {feature.title}
                          {isLocked && <span className="text-xs text-gray-500 ml-1">(🔒 Unlocks Later)</span>}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-slate-400">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center pt-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-[#fd7014] hover:bg-[#e5640f] text-white px-8 py-3 text-lg font-medium"
            >
              Start with Product Research
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
              Begin by adding products to your watchlist to research and validate opportunities
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WelcomeModal;