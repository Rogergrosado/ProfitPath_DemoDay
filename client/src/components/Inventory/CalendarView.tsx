import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Package } from "lucide-react";

interface CalendarViewProps {
  type: "sales" | "reorder";
  className?: string;
}

export function CalendarView({ type, className }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const { data: calendarData, isLoading } = useQuery({
    queryKey: [`/api/${type}/calendar`, format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const month = format(currentDate, "MM");
      const year = format(currentDate, "yyyy");
      const response = await fetch(`/api/${type}/calendar?month=${month}&year=${year}`);
      return response.json();
    },
  });

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDayData = (day: Date) => {
    if (!calendarData) return [];
    
    return calendarData.filter((item: any) => {
      const itemDate = parseISO(type === "sales" ? item.saleDate : item.reorderDate);
      return isSameDay(itemDate, day);
    });
  };

  const getDayTotal = (day: Date) => {
    const dayData = getDayData(day);
    if (type === "sales") {
      return dayData.reduce((sum: number, item: any) => sum + parseFloat(item.totalRevenue || 0), 0);
    } else {
      return dayData.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {type === "sales" ? "Sales Calendar" : "Reorder Calendar"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold min-w-[140px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const dayData = getDayData(day);
                const dayTotal = getDayTotal(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-16 p-2 border rounded-lg relative
                      ${isCurrentMonth 
                        ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                        : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50"
                      }
                      ${isToday ? "ring-2 ring-[#fd7014]" : ""}
                    `}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {format(day, "d")}
                    </div>
                    
                    {dayData.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayData.slice(0, 2).map((item: any, i: number) => (
                          <div key={i} className="text-xs">
                            <Badge 
                              variant="secondary" 
                              className={`
                                text-xs px-1 py-0 h-4
                                ${type === "sales" 
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                }
                              `}
                            >
                              {type === "sales" ? (
                                <TrendingUp className="h-2 w-2 mr-1" />
                              ) : (
                                <Package className="h-2 w-2 mr-1" />
                              )}
                              {type === "sales" 
                                ? `$${parseFloat(item.totalRevenue || 0).toFixed(0)}`
                                : `${item.quantity} units`
                              }
                            </Badge>
                          </div>
                        ))}
                        {dayData.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{dayData.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                    
                    {dayData.length > 0 && (
                      <div className="absolute bottom-1 right-1">
                        <div className={`
                          text-xs font-bold
                          ${type === "sales" 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-blue-600 dark:text-blue-400"
                          }
                        `}>
                          {type === "sales" 
                            ? `$${dayTotal.toFixed(0)}`
                            : `${dayTotal}`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}