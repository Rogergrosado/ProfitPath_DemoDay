import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Inventory from "@/pages/inventory";
import Analytics from "@/pages/analytics";
import Reports from "@/pages/reports";
import Goals from "@/pages/goals";
import Settings from "@/pages/settings";
import TestPage from "@/pages/test-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/reports" component={Reports} />
      <Route path="/goals" component={Goals} />
      <Route path="/settings" component={Settings} />
      <Route path="/test" component={TestPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <InventoryProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </InventoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
