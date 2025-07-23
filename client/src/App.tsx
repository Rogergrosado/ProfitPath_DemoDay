import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { OnboardingProvider } from "@/components/Onboarding/OnboardingProvider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Inventory from "@/pages/inventory";
import SimpleAnalytics from "@/pages/simple-analytics";
import Reports from "@/pages/reports";
import Analytics from "@/pages/analytics";
import Goals from "@/pages/goals";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import TestPage from "@/pages/test-page";
import FeatureProductResearch from "@/pages/feature-product-research";
import FeatureInventoryManagement from "@/pages/feature-inventory-management";
import FeaturePerformanceAnalytics from "@/pages/feature-performance-analytics";
import FeatureGoalTracking from "@/pages/feature-goal-tracking";
import TrophyRoomPage from "@/pages/trophies-room";
import TrophyProgressPage from "@/pages/trophies-progress";
import WelcomeModal from "@/components/Onboarding/WelcomeModal";
import { OnboardingWrapper } from "@/components/Onboarding/OnboardingWrapper";
import { useAuth } from "@/contexts/AuthContext";

function Router() {
  const { showWelcome, setShowWelcome, user } = useAuth();

  return (
    <>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/products" component={Products} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/analytics" component={Analytics} />
        {/* Legacy route redirect */}
        <Route path="/simple-analytics" component={Analytics} />
        <Route path="/reports" component={Reports} />
        <Route path="/goals" component={Goals} />
        <Route path="/goals/trophy-room" component={TrophyRoomPage} />
        <Route path="/goals/trophies-progress" component={TrophyProgressPage} />
        <Route path="/settings" component={Settings} />
        <Route path="/profile" component={Profile} />
        <Route path="/test" component={TestPage} />
        {/* Feature detail pages */}
        <Route
          path="/feature/product-research"
          component={FeatureProductResearch}
        />
        <Route
          path="/feature/inventory-management"
          component={FeatureInventoryManagement}
        />
        <Route
          path="/feature/performance-analytics"
          component={FeaturePerformanceAnalytics}
        />
        <Route path="/feature/goal-tracking" component={FeatureGoalTracking} />
        <Route component={NotFound} />
      </Switch>

      {/* Welcome Modal for new users */}
      <WelcomeModal
        isOpen={showWelcome && !!user}
        onClose={() => setShowWelcome(false)}
        userName={user?.displayName || user?.email?.split("@")[0] || "User"}
      />

      {/* Smart Onboarding Walkthrough */}
      <OnboardingWrapper />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            <InventoryProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </InventoryProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
