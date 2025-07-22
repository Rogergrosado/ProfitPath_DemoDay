import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, DollarSign } from "lucide-react";

interface SalesHistoryCalendarProps {
  className?: string;
}

export function SalesHistoryCalendar({ className = "" }: SalesHistoryCalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Fetch sales history for calendar display
  const { data: salesHistory = [], isLoading } = useQuery({
    queryKey: ["/api/sales/calendar", currentMonth + 1, currentYear],
    enabled: !!user,
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`/api/sales/calendar?month=${currentMonth + 1}&year=${currentYear}`, {
          headers: authHeaders
        });
        if (!response.ok) {
          throw new Error('Failed to fetch calendar sales');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching calendar sales:', error);
        return [];
      }
    },
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const today = new Date();

  // Group sales by date
  const salesByDate = salesHistory.reduce((acc: any, sale: any) => {
    const saleDate = new Date(sale.saleDate).getDate();
    if (!acc[saleDate]) {
      acc[saleDate] = [];
    }
    acc[saleDate].push(sale);
    return acc;
  }, {});

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getTotalForDate = (date: number) => {
    const sales = salesByDate[date] || [];
    return sales.reduce((total: number, sale: any) => total + parseFloat(sale.totalRevenue || 0), 0);
  };

  const renderCalendarDay = (day: number) => {
    const sales = salesByDate[day] || [];
    const totalRevenue = getTotalForDate(day);
    const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const hasSales = sales.length > 0;

    return (
      <div
        key={day}
        className={`
          min-h-[80px] p-2 border border-gray-200 dark:border-slate-600 
          ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : 'bg-white dark:bg-slate-800'}
          ${hasSales ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700' : ''}
        `}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {day}
          </span>
          {hasSales && (
            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
              {sales.length}
            </Badge>
          )}
        </div>
        {hasSales && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-green-600 dark:text-green-400">
              ${totalRevenue.toFixed(0)}
            </div>
            {sales.slice(0, 2).map((sale: any, index: number) => (
              <div key={index} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                {sale.productName || sale.sku}
              </div>
            ))}
            {sales.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{sales.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Calculate monthly totals
  const monthlyRevenue = salesHistory.reduce((total: number, sale: any) => 
    total + parseFloat(sale.totalRevenue || 0), 0
  );
  const monthlyUnits = salesHistory.reduce((total: number, sale: any) => 
    total + parseInt(sale.quantity || 0), 0
  );
  const averageDailySales = monthlyRevenue / daysInMonth;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Sales History Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading sales calendar...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Sales History Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm">
              {months[currentMonth]} {currentYear}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Monthly Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-600 dark:text-green-400">Monthly Revenue</span>
            </div>
            <div className="font-bold text-green-800 dark:text-green-200">${monthlyRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-400">Units Sold</span>
            </div>
            <div className="font-bold text-blue-800 dark:text-blue-200">{monthlyUnits}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-orange-600 dark:text-orange-400">Avg Daily Sales</span>
            </div>
            <div className="font-bold text-orange-800 dark:text-orange-200">${averageDailySales.toFixed(0)}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] p-2 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900" />
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: daysInMonth }, (_, i) => renderCalendarDay(i + 1))}
        </div>

        {salesHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sales recorded for {months[currentMonth]} {currentYear}</p>
            <p className="text-sm mt-2">Record sales to see them appear on the calendar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}