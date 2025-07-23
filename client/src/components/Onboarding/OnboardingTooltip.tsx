import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';

interface OnboardingTooltipProps {
  stepId: string;
}

export function OnboardingTooltip({ stepId }: OnboardingTooltipProps) {
  const { isStepVisible, steps, currentStep, nextStep, previousStep, skipOnboarding } = useOnboarding();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const step = steps[currentStep];
  const isCurrentStep = isStepVisible(stepId);

  useEffect(() => {
    if (isCurrentStep && step) {
      const target = document.querySelector(step.target) as HTMLElement;
      if (target || step.target === 'body') {
        const rect = target?.getBoundingClientRect() || { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 };
        
        // Center the tooltip on screen for better accessibility
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        let top = centerY - tooltipHeight / 2;
        let left = centerX - tooltipWidth / 2;
        
        // Add slight bias toward the target element (20% of the way)
        const targetCenterX = rect.left + rect.width / 2;
        const targetCenterY = rect.top + rect.height / 2;
        
        if (step.target !== 'body') {
          left = left + (targetCenterX - centerX) * 0.2;
          top = top + (targetCenterY - centerY) * 0.2;
        }

        // Ensure tooltip stays within viewport with comfortable margins
        top = Math.max(50, Math.min(top, window.innerHeight - tooltipHeight - 50));
        left = Math.max(50, Math.min(left, window.innerWidth - tooltipWidth - 50));

        setPosition({ top, left });
        
        // Add highlight to target element
        if (target && step.target !== 'body') {
          target.style.position = 'relative';
          target.style.zIndex = '1001';
          target.style.boxShadow = '0 0 0 3px rgba(253, 112, 20, 0.6), 0 0 0 6px rgba(253, 112, 20, 0.3), 0 0 20px rgba(253, 112, 20, 0.2)';
          target.style.borderRadius = '8px';
          target.style.transition = 'all 0.3s ease-in-out';
        }

        setIsVisible(true);

        return () => {
          if (target && step.target !== 'body') {
            target.style.position = '';
            target.style.zIndex = '';
            target.style.boxShadow = '';
            target.style.borderRadius = '';
          }
        };
      }
    } else {
      setIsVisible(false);
    }
  }, [isCurrentStep, step, currentStep]);

  if (!isCurrentStep || !step || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-1000" style={{ zIndex: 1000 }} />
      
      {/* Tooltip */}
      <Card 
        className="fixed w-80 bg-white dark:bg-gray-800 border-2 border-[#fd7014] shadow-2xl z-1002 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{ 
          top: position.top, 
          left: position.left,
          zIndex: 1002,
          transform: 'translateZ(0)' // Force hardware acceleration for smooth positioning
        }}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipOnboarding}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {step.title}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {step.description}
          </p>
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={skipOnboarding}
              className="text-muted-foreground"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip Tour
            </Button>
            
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={nextStep}
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep !== steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#fd7014] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}