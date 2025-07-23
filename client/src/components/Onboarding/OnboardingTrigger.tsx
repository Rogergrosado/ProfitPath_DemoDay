import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';

export function OnboardingTrigger() {
  const { startOnboarding } = useOnboarding();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startOnboarding}
      className="text-muted-foreground hover:text-[#fd7014] hover:border-[#fd7014]"
      title="Take a tour of ProfitPath"
    >
      <HelpCircle className="h-4 w-4 mr-2" />
      Take Tour
    </Button>
  );
}