import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface OnboardingContextType {
  hasCompletedWelcome: boolean;
  hasSalesData: boolean;
  hasProducts: boolean;
  hasInventory: boolean;
  unlockAdvancedFeatures: boolean;
  currentStep: string;
  completeWelcome: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState(false);

  // Check user progress data
  const { data: salesResponse } = useQuery({
    queryKey: ['/api/sales'],
    enabled: !!user
  });

  const { data: productsResponse } = useQuery({
    queryKey: ['/api/products'],
    enabled: !!user
  });

  const { data: inventoryResponse } = useQuery({
    queryKey: ['/api/inventory'],
    enabled: !!user
  });

  // Extract data from paginated responses
  const salesData = (salesResponse as any)?.results || [];
  const productsData = (productsResponse as any)?.results || [];
  const inventoryData = (inventoryResponse as any)?.results || [];

  // Calculate user progress
  const hasSalesData = salesData.length > 0;
  const hasProducts = productsData.length > 0;
  const hasInventory = inventoryData.length > 0;
  const unlockAdvancedFeatures = hasSalesData; // Advanced features unlock after sales data

  // Determine current step
  let currentStep = 'welcome';
  if (hasCompletedWelcome && !hasProducts) {
    currentStep = 'add_products';
  } else if (hasProducts && !hasInventory) {
    currentStep = 'promote_to_inventory';
  } else if (hasInventory && !hasSalesData) {
    currentStep = 'add_sales_data';
  } else if (hasSalesData) {
    currentStep = 'complete';
  }

  useEffect(() => {
    // Check if user has completed welcome from localStorage
    const welcomed = localStorage.getItem(`welcomed_${user?.id}`);
    if (welcomed) {
      setHasCompletedWelcome(true);
    }
  }, [user]);

  const completeWelcome = () => {
    setHasCompletedWelcome(true);
    if (user) {
      localStorage.setItem(`welcomed_${user.id}`, 'true');
    }
  };

  return (
    <OnboardingContext.Provider value={{
      hasCompletedWelcome,
      hasSalesData,
      hasProducts,
      hasInventory,
      unlockAdvancedFeatures,
      currentStep,
      completeWelcome
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}