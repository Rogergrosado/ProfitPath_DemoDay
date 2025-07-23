import { useEffect } from "react";
import confetti from "canvas-confetti";

interface GoalCelebrationProps {
  isTriggered: boolean;
  goalTitle: string;
  achievedValue: number;
  targetValue: number;
  onComplete?: () => void;
}

export function GoalCelebration({ 
  isTriggered, 
  goalTitle, 
  achievedValue, 
  targetValue, 
  onComplete 
}: GoalCelebrationProps) {
  
  useEffect(() => {
    if (!isTriggered) return;
    
    console.log(`🎉 Goal completed celebration for: ${goalTitle}`);
    
    // Trophy celebration animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Left side burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      
      // Right side burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Additional trophy burst after 1 second
    setTimeout(() => {
      confetti({
        particleCount: 100,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2
        },
        colors: ['#fd7014', '#FFD700', '#FF6B35', '#F7931E']
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isTriggered, goalTitle, onComplete]);

  if (!isTriggered) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="bg-green-600/90 text-white p-6 rounded-lg shadow-lg animate-bounce">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-xl font-bold mb-2">Goal Achieved!</h3>
          <p className="text-sm opacity-90 mb-1">{goalTitle}</p>
          <p className="text-xs opacity-75">
            {achievedValue} / {targetValue} ({Math.round((achievedValue / targetValue) * 100)}%)
          </p>
        </div>
      </div>
    </div>
  );
}