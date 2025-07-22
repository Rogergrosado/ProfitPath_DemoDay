import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  content: string;
}

const TooltipWrapper = ({ children, content }: TooltipWrapperProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const StockTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="💡 Pro tip: Track your total SKUs like a hawk! Each SKU is a potential profit center - diversify smartly but don't spread yourself too thin. Quality over quantity wins every time!"
  >
    {children}
  </TooltipWrapper>
);

export const PricingTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="💰 Money talks! Your total inventory value is your sleeping giant. The key is velocity - dead stock is dead profit. Keep it moving!"
  >
    {children}
  </TooltipWrapper>
);

export const ReorderTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="🚨 Low stock alerts are your early warning system! Set reorder points like a chess master - always think 3 moves ahead. Stockouts = lost sales = sad customers!"
  >
    {children}
  </TooltipWrapper>
);

export const OutOfStockTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="😱 Zero stock is a seller's nightmare! But don't panic-buy. Analyze the data, understand why it happened, and create bulletproof reorder strategies. Learn, adapt, dominate!"
  >
    {children}
  </TooltipWrapper>
);

export const CalendarTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="📅 Your reorder calendar is your crystal ball! Plan restocks like a fortune teller who actually knows the future. Seasonality, trends, and lead times are your best friends!"
  >
    {children}
  </TooltipWrapper>
);

export const AnalyticsTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="📊 Data doesn't lie, but it sure can be dramatic! Dive deep into your analytics - every metric tells a story. The story of your profits, your growth, your empire!"
  >
    {children}
  </TooltipWrapper>
);

export const ProfitTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="🎯 Profit margin is your score in the e-commerce game! High margins = breathing room for experiments. Low margins = time to optimize or pivot. Play to win!"
  >
    {children}
  </TooltipWrapper>
);

export const VelocityTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="🏃‍♂️ Sales velocity is everything! Fast movers deserve prime real estate in your inventory. Slow movers? Time for marketing magic or strategic clearance!"
  >
    {children}
  </TooltipWrapper>
);

export const SupplierTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="🤝 Your suppliers are your business partners, not just vendors! Build relationships, negotiate like a diplomat, and always have backup plans. Supply chain disruptions happen!"
  >
    {children}
  </TooltipWrapper>
);

export const LeadTimeTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipWrapper
    content="⏰ Lead time is the heartbeat of your business! Know it, respect it, plan around it. Buffer time isn't paranoia - it's professionalism!"
  >
    {children}
  </TooltipWrapper>
);