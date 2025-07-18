import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

interface ReorderCalendarProps {
  items: any[];
}

export function ReorderCalendar({ items }: ReorderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate reorder dates for items
  const getReorderItems = () => {
    return items
      .filter(item => {
        const currentStock = item.currentStock || 0;
        const reorderPoint = item.reorderPoint || 0;
        const leadTimeDays = item.leadTimeDays || 7;
        
        // Calculate when to reorder based on current stock and lead time
        const daysUntilReorder = Math.max(0, currentStock - reorderPoint);
        const reorderDate = new Date();
        reorderDate.setDate(reorderDate.getDate() + daysUntilReorder);
        
        return currentStock <= reorderPoint * 2; // Show items that need attention soon
      })
      .map(item => {
        const currentStock = item.currentStock || 0;
        const reorderPoint = item.reorderPoint || 0;
        const leadTimeDays = item.leadTimeDays || 7;
        
        let urgency = 'medium';
        let reorderDate = new Date();
        
        if (currentStock <= reorderPoint) {
          urgency = 'high';
          reorderDate.setDate(reorderDate.getDate() + leadTimeDays);
        } else if (currentStock <= reorderPoint * 1.5) {
          urgency = 'medium';
          const daysUntilReorder = Math.floor((currentStock - reorderPoint) / 2);
          reorderDate.setDate(reorderDate.getDate() + daysUntilReorder);
        } else {
          urgency = 'low';
          const daysUntilReorder = currentStock - reorderPoint;
          reorderDate.setDate(reorderDate.getDate() + daysUntilReorder);
        }
        
        return {
          ...item,
          reorderDate,
          urgency,
          daysToReorder: Math.ceil((reorderDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        };
      })
      .sort((a, b) => a.reorderDate.getTime() - b.reorderDate.getTime());
  };

  const reorderItems = getReorderItems();

  // Generate calendar days for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const monthDays = getDaysInMonth(currentDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getItemsForDate = (date: Date) => {
    return reorderItems.filter(item => {
      const itemDate = new Date(item.reorderDate);
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-black dark:text-white">
              <Calendar className="h-5 w-5 mr-2 text-[#fd7014]" />
              Reorder Calendar
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold text-black dark:text-white min-w-[140px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
            
            {monthDays.map((day, index) => {
              const itemsForDate = getItemsForDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border border-gray-200 dark:border-slate-600 rounded-lg ${
                    isCurrentMonth 
                      ? 'bg-white dark:bg-slate-800' 
                      : 'bg-gray-50 dark:bg-slate-700/50'
                  } ${isToday ? 'ring-2 ring-[#fd7014]' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth 
                      ? 'text-black dark:text-white' 
                      : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {itemsForDate.slice(0, 2).map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={`text-xs p-1 rounded text-white ${getUrgencyColor(item.urgency)} truncate`}
                        title={`${item.name} - ${item.sku}`}
                      >
                        {item.name.length > 8 ? `${item.name.substring(0, 8)}...` : item.name}
                      </div>
                    ))}
                    {itemsForDate.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{itemsForDate.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Low</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Reorders List */}
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Upcoming Reorders</CardTitle>
        </CardHeader>
        <CardContent>
          {reorderItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No items need reordering in the near future</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reorderItems.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getUrgencyColor(item.urgency)}`}></div>
                    <div>
                      <h3 className="font-medium text-black dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SKU: {item.sku} | Current Stock: {item.currentStock || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-black dark:text-white">
                      {item.daysToReorder <= 0 ? 'Reorder Now' : `${item.daysToReorder} days`}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {item.reorderDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}