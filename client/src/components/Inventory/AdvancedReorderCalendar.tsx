import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download
} from "lucide-react";

interface ReorderEvent {
  id: string;
  sku: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  daysUntilReorder: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: string;
  supplier: string;
  leadTime: number;
  date: Date;
}

const PRIORITY_CONFIGS = {
  urgent: { color: 'bg-red-500', textColor: 'text-red-600', label: 'Urgent' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-600', label: 'High' },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-600', label: 'Medium' },
  low: { color: 'bg-green-500', textColor: 'text-green-600', label: 'Low' },
};

export function AdvancedReorderCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateEvents, setDateEvents] = useState<ReorderEvent[]>([]);

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // Calculate reorder events based on inventory levels only
  const reorderEvents = useMemo(() => {
    const events: ReorderEvent[] = [];
    const today = new Date();

    inventory.forEach((item: any) => {
      const currentStock = item.currentStock || 0;
      const reorderPoint = item.reorderPoint || 10;
      const leadTime = item.leadTimeDays || 7; // days

      // Calculate days until reorder point based on current stock status
      let daysUntilReorder = 0;
      if (currentStock <= reorderPoint) {
        daysUntilReorder = 0; // Immediate reorder needed
      } else {
        // Estimate based on stock level and reorder point
        const stockAboveReorder = currentStock - reorderPoint;
        daysUntilReorder = Math.ceil(stockAboveReorder / 2); // Conservative estimate
      }

      // Determine priority based on urgency
      let priority: 'urgent' | 'high' | 'medium' | 'low' = 'low';
      if (currentStock <= 0) priority = 'urgent';
      else if (currentStock <= reorderPoint) priority = 'urgent';
      else if (daysUntilReorder <= 7) priority = 'high';
      else if (daysUntilReorder <= 14) priority = 'medium';

      // Calculate suggested reorder quantity
      const suggestedQuantity = Math.max(50, reorderPoint * 2); // Conservative reorder amount

      // Create reorder event
      const reorderDate = new Date(today.getTime() + daysUntilReorder * 24 * 60 * 60 * 1000);
      
      events.push({
        id: `reorder-${item.id}`,
        sku: item.sku,
        productName: item.name,
        currentStock,
        reorderPoint,
        suggestedQuantity,
        daysUntilReorder,
        priority,
        category: item.category || 'Uncategorized',
        supplier: item.supplierName || 'Default Supplier',
        leadTime,
        date: reorderDate,
      });
    });

    return events;
  }, [inventory]);

  // Filter events
  const filteredEvents = reorderEvents.filter(event => {
    const categoryMatch = selectedCategory === "all" || event.category === selectedCategory;
    const priorityMatch = selectedPriority === "all" || event.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  // Get unique categories
  const categories = Array.from(new Set(inventory.map((item: any) => item.category).filter(Boolean)));

  // Calendar generation
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = filteredEvents.filter(event => 
        event.date.toDateString() === current.toDateString()
      );
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        events: dayEvents,
      });
      
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const upcomingEvents = filteredEvents
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reorder Calendar</h2>
          <p className="text-muted-foreground">Smart reorder scheduling based on stock levels</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border rounded cursor-pointer transition-colors
                      ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                      ${day.isToday ? 'ring-2 ring-primary' : ''}
                      hover:bg-muted/50
                    `}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setDateEvents(day.events);
                      setShowDateModal(true);
                    }}
                  >
                    <div className="text-sm font-medium mb-1">
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map(event => {
                        const config = PRIORITY_CONFIGS[event.priority];
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${config.color}/20 ${config.textColor}`}
                          >
                            {event.productName}
                          </div>
                        );
                      })}
                      {day.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Upcoming Reorders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map(event => {
                  const config = PRIORITY_CONFIGS[event.priority];
                  return (
                    <div key={event.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">{event.productName}</div>
                        <Badge className={`${config.color}/20 ${config.textColor}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>SKU: {event.sku}</div>
                        <div>Stock: {event.currentStock} units</div>
                        <div>Due: {event.date.toLocaleDateString()}</div>
                        <div>Suggested qty: {event.suggestedQuantity}</div>
                      </div>
                    </div>
                  );
                })}
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming reorders</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reorder Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Events</span>
                  <span className="font-medium">{filteredEvents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Urgent</span>
                  <span className="font-medium">{filteredEvents.filter(e => e.priority === 'urgent').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-orange-600">High Priority</span>
                  <span className="font-medium">{filteredEvents.filter(e => e.priority === 'high').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-yellow-600">Medium Priority</span>
                  <span className="font-medium">{filteredEvents.filter(e => e.priority === 'medium').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Date Modal */}
      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Reorders for {selectedDate.toLocaleDateString()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map(event => {
                const config = PRIORITY_CONFIGS[event.priority];
                return (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{event.productName}</div>
                          <div className="text-sm text-muted-foreground">SKU: {event.sku}</div>
                        </div>
                        <Badge className={`${config.color}/20 ${config.textColor}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Current Stock</div>
                          <div className="font-medium">{event.currentStock} units</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Reorder Point</div>
                          <div className="font-medium">{event.reorderPoint} units</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Suggested Quantity</div>
                          <div className="font-medium">{event.suggestedQuantity} units</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Lead Time</div>
                          <div className="font-medium">{event.leadTime} days</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No reorders scheduled for this date
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}