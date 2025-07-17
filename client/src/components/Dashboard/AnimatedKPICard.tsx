import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AnimatedKPICardProps {
  title: string;
  value: number;
  previousValue: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  iconColor: string;
  delay?: number;
}

export function AnimatedKPICard({
  title,
  value,
  previousValue,
  prefix = '',
  suffix = '',
  icon: Icon,
  iconColor,
  delay = 0
}: AnimatedKPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      const duration = 2000;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.round(value * easeOutQuart));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const changePercentage = previousValue > 0 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;
  
  const isPositiveChange = changePercentage >= 0;

  const formatValue = (val: number) => {
    if (prefix === '$' && val >= 1000000) {
      return `${prefix}${(val / 1000000).toFixed(1)}M`;
    } else if (prefix === '$' && val >= 1000) {
      return `${prefix}${(val / 1000).toFixed(1)}K`;
    } else if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M${suffix}`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K${suffix}`;
    }
    return `${prefix}${val.toLocaleString()}${suffix}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-card-foreground">
                  {formatValue(displayValue)}
                </h3>
                {changePercentage !== 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 }}
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isPositiveChange
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {isPositiveChange ? '+' : ''}{changePercentage.toFixed(1)}%
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs previous period
              </p>
            </div>
            <div className={`p-3 rounded-lg ${iconColor}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          
          {/* Progress bar animation */}
          <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: isAnimating ? '100%' : '100%' }}
              transition={{ duration: 2, delay: delay / 1000 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}