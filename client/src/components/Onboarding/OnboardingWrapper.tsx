import React from 'react';
import { useLocation } from 'wouter';
import { OnboardingTooltip } from './OnboardingTooltip';
import { useOnboarding } from './OnboardingProvider';

export function OnboardingWrapper() {
  const [location] = useLocation();
  const { isActive, steps, currentStep } = useOnboarding();

  if (!isActive) return null;

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  // Check if we're on the correct page for the current step
  const currentPage = location.substring(1) || 'dashboard';
  if (currentStepData.page !== currentPage) return null;

  return <OnboardingTooltip stepId={currentStepData.id} />;
}