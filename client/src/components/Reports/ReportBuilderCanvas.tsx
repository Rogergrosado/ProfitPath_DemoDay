import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Table, 
  Gauge, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  Settings,
  GripVertical
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { KPIWidget } from "./widgets/KPIWidget";
import { ChartWidget } from "./widgets/ChartWidget";
import { TableWidget } from "./widgets/TableWidget";

export interface ReportWidget {
  id: string;
  type: "kpi" | "chart" | "table" | "text";
  title: string;
  config: {
    dataSource: string;
    metric?: string;
    chartType?: "line" | "bar" | "pie";
    timeframe?: string;
    category?: string;
  };
  position: number;
}

const WIDGET_TYPES = [
  { 
    type: "kpi" as const, 
    label: "KPI Card", 
    icon: Gauge,
    description: "Display key performance indicators"
  },
  { 
    type: "chart" as const, 
    label: "Line Chart", 
    icon: LineChart,
    description: "Show trends over time"
  },
  { 
    type: "chart" as const, 
    label: "Bar Chart", 
    icon: BarChart3,
    description: "Compare values across categories"
  },
  { 
    type: "chart" as const, 
    label: "Pie Chart", 
    icon: PieChart,
    description: "Show proportional data"
  },
  { 
    type: "table" as const, 
    label: "Data Table", 
    icon: Table,
    description: "Display detailed tabular data"
  },
  { 
    type: "text" as const, 
    label: "Text Block", 
    icon: FileText,
    description: "Add descriptions or notes"
  },
];

interface DraggableWidgetProps {
  widget: ReportWidget;
  onRemove: (id: string) => void;
  onConfig: (id: string) => void;
}

function DraggableWidget({ widget, onRemove, onConfig }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: widget.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{widget.title}</CardTitle>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onConfig(widget.id)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(widget.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <div 
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <GripVertical className="h-3 w-3" />
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit text-xs">
          {widget.config.dataSource}
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        {widget.type === "kpi" && <KPIWidget widget={widget} />}
        {widget.type === "chart" && <ChartWidget widget={widget} />}
        {widget.type === "table" && <TableWidget widget={widget} />}
        {widget.type === "text" && (
          <div className="text-sm text-muted-foreground min-h-[60px] p-2 border rounded border-dashed">
            Text content placeholder
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DroppableCanvasProps {
  widgets: ReportWidget[];
  onWidgetMove: (widgets: ReportWidget[]) => void;
  onRemoveWidget: (id: string) => void;
  onConfigWidget: (id: string) => void;
}

function DroppableCanvas({ widgets, onWidgetMove, onRemoveWidget, onConfigWidget }: DroppableCanvasProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "report-canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] p-4 border-2 border-dashed rounded-lg transition-colors ${
        isOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50" : "border-gray-300 dark:border-gray-700"
      }`}
    >
      {widgets.length === 0 ? (
        <div className="text-center text-muted-foreground h-full flex items-center justify-center">
          <div>
            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Drag widgets here to build your report</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map((widget) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              onRemove={onRemoveWidget}
              onConfig={onConfigWidget}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReportBuilderCanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportBuilderCanvas({ isOpen, onClose }: ReportBuilderCanvasProps) {
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [activeWidget, setActiveWidget] = useState<ReportWidget | null>(null);
  const [configWidget, setConfigWidget] = useState<ReportWidget | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const saveReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Saved",
        description: "Your custom report has been created successfully.",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save report",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const widget = widgets.find(w => w.id === active.id);
    setActiveWidget(widget || null);
  }, [widgets]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveWidget(null);

    if (!over) return;

    // Handle dropping new widget from palette
    if (active.data.current?.type === "widget-type") {
      const widgetType = active.data.current.widgetType;
      const newWidget: ReportWidget = {
        id: `widget-${Date.now()}`,
        type: widgetType.type,
        title: widgetType.label,
        config: {
          dataSource: "sales",
          metric: "revenue",
          chartType: widgetType.type === "chart" ? "line" : undefined,
          timeframe: "30d"
        },
        position: widgets.length,
      };
      setWidgets(prev => [...prev, newWidget]);
      return;
    }

    // Handle reordering existing widgets
    if (active.id !== over.id) {
      const activeIndex = widgets.findIndex(w => w.id === active.id);
      const overIndex = widgets.findIndex(w => w.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newWidgets = arrayMove(widgets, activeIndex, overIndex);
        setWidgets(newWidgets.map((widget, index) => ({
          ...widget,
          position: index
        })));
      }
    }
  }, [widgets]);

  const handleAddWidget = (widgetType: typeof WIDGET_TYPES[0]) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType.type,
      title: widgetType.label,
      config: {
        dataSource: "sales",
        metric: "revenue",
        chartType: widgetType.type === "chart" ? "line" : undefined,
        timeframe: "30d"
      },
      position: widgets.length,
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const handleConfigWidget = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      setConfigWidget(widget);
    }
  };

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      toast({
        title: "Missing Report Name",
        description: "Please enter a name for your report",
        variant: "destructive",
      });
      return;
    }

    if (widgets.length === 0) {
      toast({
        title: "Empty Report",
        description: "Please add at least one widget to your report",
        variant: "destructive",
      });
      return;
    }

    const reportData = {
      name: reportName,
      description: reportDescription,
      widgets: widgets.map(w => ({
        ...w,
        position: { x: 0, y: w.position },
        size: { width: 1, height: 1 }
      })),
      config: {
        layout: 'grid',
        theme: 'default',
        exportFormats: ['pdf', 'csv']
      }
    };

    saveReportMutation.mutate(reportData);
  };

  const handleClose = () => {
    setReportName("");
    setReportDescription("");
    setWidgets([]);
    setConfigWidget(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build Custom Report</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-6">
          {/* Widget Palette */}
          <div className="col-span-1 space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Report Details</h3>
              <div className="space-y-3">
                <div>
                  <Label>Report Name *</Label>
                  <Input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Widget Library</h3>
              <div className="space-y-2">
                {WIDGET_TYPES.map((widgetType) => (
                  <Card
                    key={`${widgetType.type}-${widgetType.label}`}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleAddWidget(widgetType)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <widgetType.icon className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{widgetType.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {widgetType.description}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Report Canvas */}
          <div className="col-span-3">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Report Canvas</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveReport}
                      disabled={saveReportMutation.isPending}
                      className="bg-[#fd7014] hover:bg-[#e5640f]"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveReportMutation.isPending ? "Saving..." : "Save Report"}
                    </Button>
                  </div>
                </div>

                <DroppableCanvas
                  widgets={widgets}
                  onWidgetMove={setWidgets}
                  onRemoveWidget={handleRemoveWidget}
                  onConfigWidget={handleConfigWidget}
                />
              </div>

              <DragOverlay>
                {activeWidget ? (
                  <Card className="opacity-80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{activeWidget.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Widget Configuration Modal */}
        {configWidget && (
          <Dialog open={!!configWidget} onOpenChange={() => setConfigWidget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Widget: {configWidget.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Data Source</Label>
                  <Select 
                    value={configWidget.config.dataSource}
                    onValueChange={(value) => {
                      const updatedWidget = {
                        ...configWidget,
                        config: { ...configWidget.config, dataSource: value }
                      };
                      setWidgets(prev => prev.map(w => 
                        w.id === configWidget.id ? updatedWidget : w
                      ));
                      setConfigWidget(updatedWidget);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Data</SelectItem>
                      <SelectItem value="inventory">Inventory Data</SelectItem>
                      <SelectItem value="goals">Goals Data</SelectItem>
                      <SelectItem value="performance">Performance Metrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {configWidget.type === "kpi" && (
                  <div>
                    <Label>Metric</Label>
                    <Select 
                      value={configWidget.config.metric}
                      onValueChange={(value) => {
                        const updatedWidget = {
                          ...configWidget,
                          config: { ...configWidget.config, metric: value }
                        };
                        setWidgets(prev => prev.map(w => 
                          w.id === configWidget.id ? updatedWidget : w
                        ));
                        setConfigWidget(updatedWidget);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Total Revenue</SelectItem>
                        <SelectItem value="profit">Total Profit</SelectItem>
                        <SelectItem value="units">Units Sold</SelectItem>
                        <SelectItem value="orders">Total Orders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button 
                  onClick={() => setConfigWidget(null)}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}