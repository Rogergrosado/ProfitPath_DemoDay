import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  page: string;
  action?: () => void;
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  completeWelcome: () => void;
  isStepVisible: (stepId: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ProfitPath!',
    description: 'Your comprehensive Amazon FBA business intelligence platform. Let\'s take a quick tour of the key features.',
    target: 'body',
    position: 'bottom',
    page: 'dashboard'
  },
  {
    id: 'sidebar-navigation',
    title: 'Navigation Sidebar',
    description: 'Access all your business tools from this sidebar. Dashboard, Analytics, Goals, and more.',
    target: '[data-onboarding="sidebar"]',
    position: 'right',
    page: 'dashboard'
  },
  {
    id: 'dashboard-kpis',
    title: 'Key Performance Indicators',
    description: 'Monitor your business performance at a glance. Revenue, profit, units sold, and conversion rates.',
    target: '[data-onboarding="dashboard-kpis"]',
    position: 'bottom',
    page: 'dashboard'
  },
  {
    id: 'inventory-overview',
    title: 'Inventory Snapshot',
    description: 'Quick view of your inventory status, including low stock alerts and total value.',
    target: '[data-onboarding="inventory-snapshot"]',
    position: 'top',
    page: 'dashboard'
  },
  {
    id: 'products-page',
    title: 'Product Management',
    description: 'Manage your product pipeline from research to active inventory. Track watchlist items and promote them when ready.',
    target: '[data-onboarding="products-main"]',
    position: 'bottom',
    page: 'products'
  },
  {
    id: 'add-product',
    title: 'Add New Products',
    description: 'Click here to add new products to your watchlist or inventory for tracking and analysis.',
    target: '[data-onboarding="add-product-btn"]',
    position: 'bottom',
    page: 'products'
  },
  {
    id: 'inventory-management',
    title: 'Inventory Management',
    description: 'Comprehensive inventory tracking with reorder alerts, stock levels, and sales history.',
    target: '[data-onboarding="inventory-main"]',
    position: 'bottom',
    page: 'inventory'
  },
  {
    id: 'goals-tracking',
    title: 'Goal Setting & Tracking',
    description: 'Set business goals and track your progress. Monitor revenue targets, unit sales, and profit margins.',
    target: '[data-onboarding="goals-main"]',
    position: 'bottom',
    page: 'goals'
  },
  {
    id: 'reports-builder',
    title: 'Advanced Reports',
    description: 'Create custom reports with drag-and-drop widgets. Export as PDF or CSV for stakeholder sharing.',
    target: '[data-onboarding="reports-main"]',
    position: 'bottom',
    page: 'reports'
  },
  {
    id: 'completion',
    title: 'You\'re All Set!',
    description: 'You\'ve completed the tour! Start by adding your first products and setting up your business goals.',
    target: 'body',
    position: 'bottom',
    page: 'dashboard'
  }
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (user && !hasCompletedOnboarding) {
      const completed = localStorage.getItem(`onboarding_completed_${user.firebaseUid}`);
      if (!completed) {
        // Start onboarding for new users after a short delay
        const timer = setTimeout(() => {
          setIsActive(true);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        setHasCompletedOnboarding(true);
      }
    }
  }, [user, hasCompletedOnboarding]);

  const startOnboarding = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    setIsActive(false);
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.firebaseUid}`, 'true');
      setHasCompletedOnboarding(true);
    }
  };

  const completeOnboarding = () => {
    setIsActive(false);
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.firebaseUid}`, 'true');
      setHasCompletedOnboarding(true);
    }
  };

  const completeWelcome = () => {
    // For compatibility with existing WelcomeModal
    setHasCompletedOnboarding(true);
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.firebaseUid}`, 'true');
    }
  };

  const isStepVisible = (stepId: string) => {
    if (!isActive) return false;
    const step = ONBOARDING_STEPS[currentStep];
    return step?.id === stepId;
  };

  const value: OnboardingContextType = {
    isActive,
    currentStep,
    steps: ONBOARDING_STEPS,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    completeWelcome,
    isStepVisible,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}