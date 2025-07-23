import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Move, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Table,
  DollarSign,
  Package,
  Calendar,
  Download,
  Eye,
  FileText,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReportBuilderCanvas } from "./ReportBuilderCanvas";

interface ReportWidget {
  id: string;
  type: 'chart' | 'table' | 'kpi' | 'text';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: any;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  widgets: ReportWidget[];
  tags: string[];
}

const WIDGET_TYPES = [
  { type: 'kpi', label: 'KPI Card', icon: DollarSign, description: 'Display key metrics' },
  { type: 'chart', label: 'Line Chart', icon: TrendingUp, description: 'Trends over time' },
  { type: 'chart', label: 'Bar Chart', icon: BarChart3, description: 'Compare categories' },
  { type: 'chart', label: 'Pie Chart', icon: PieChart, description: 'Show proportions' },
  { type: 'table', label: 'Data Table', icon: Table, description: 'Detailed data view' },
  { type: 'text', label: 'Text Block', icon: FileText, description: 'Add descriptions' },
];

const PREDEFINED_TEMPLATES: ReportTemplate[] = [
  {
    id: 'inventory-overview',
    name: 'Inventory Overview',
    description: 'Complete inventory analysis with stock levels and performance',
    category: 'Inventory',
    tags: ['inventory', 'stock', 'performance'],
    widgets: [
      {
        id: '1',
        type: 'kpi',
        title: 'Total SKUs',
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        config: { metric: 'totalItems', dataSource: 'inventory' }
      },
      {
        id: '2',
        type: 'kpi',
        title: 'Total Value',
        position: { x: 1, y: 0 },
        size: { width: 1, height: 1 },
        config: { metric: 'totalValue', dataSource: 'inventory', format: 'currency' }
      },
      {
        id: '3',
        type: 'chart',
        title: 'Stock Levels by Category',
        position: { x: 0, y: 1 },
        size: { width: 2, height: 2 },
        config: { chartType: 'bar', dataSource: 'inventory', groupBy: 'category' }
      }
    ]
  },
  {
    id: 'sales-performance',
    name: 'Sales Performance Dashboard',
    description: 'Revenue, profit, and sales trends analysis',
    category: 'Sales',
    tags: ['sales', 'revenue', 'profit', 'performance'],
    widgets: [
      {
        id: '1',
        type: 'kpi',
        title: 'Monthly Revenue',
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        config: { metric: 'totalRevenue', dataSource: 'sales', format: 'currency' }
      },
      {
        id: '2',
        type: 'kpi',
        title: 'Units Sold',
        position: { x: 1, y: 0 },
        size: { width: 1, height: 1 },
        config: { metric: 'totalUnits', dataSource: 'sales' }
      },
      {
        id: '3',
        type: 'chart',
        title: 'Revenue Trend',
        position: { x: 0, y: 1 },
        size: { width: 2, height: 2 },
        config: { chartType: 'line', dataSource: 'sales', metric: 'revenue', timeframe: '30d' }
      }
    ]
  },
  {
    id: 'profit-analysis',
    name: 'Profit Analysis Report',
    description: 'Detailed profit margins and cost analysis',
    category: 'Finance',
    tags: ['profit', 'margin', 'cost', 'analysis'],
    widgets: [
      {
        id: '1',
        type: 'kpi',
        title: 'Total Profit',
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        config: { metric: 'totalProfit', dataSource: 'sales', format: 'currency' }
      },
      {
        id: '2',
        type: 'kpi',
        title: 'Profit Margin',
        position: { x: 1, y: 0 },
        size: { width: 1, height: 1 },
        config: { metric: 'profitMargin', dataSource: 'sales', format: 'percentage' }
      },
      {
        id: '3',
        type: 'chart',
        title: 'Profit by Category',
        position: { x: 0, y: 1 },
        size: { width: 2, height: 2 },
        config: { chartType: 'pie', dataSource: 'sales', groupBy: 'category', metric: 'profit' }
      }
    ]
  }
];

export function AdvancedReportBuilder() {
  const { toast } = useToast();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [draggedWidget, setDraggedWidget] = useState<ReportWidget | null>(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports"],
  });

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': JSON.parse(localStorage.getItem('current-user') || '{}').id
        },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) throw new Error('Failed to create report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Created",
        description: "Your custom report has been generated successfully.",
      });
      setIsBuilderOpen(false);
      resetBuilder();
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: async ({ id, format }: { id: string; format: 'pdf' | 'csv' }) => {
      const response = await fetch(`/api/reports/${id}/export?format=${format}`, {
        method: 'POST',
        headers: { 'x-user-id': JSON.parse(localStorage.getItem('current-user') || '{}').id },
      });
      if (!response.ok) throw new Error('Export failed');
      return response.blob();
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export Complete",
        description: `Report exported as ${variables.format.toUpperCase()}`,
      });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': JSON.parse(localStorage.getItem('current-user') || '{}').id },
      });
      if (!response.ok) throw new Error('Failed to delete report');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Deleted",
        description: "Report has been removed successfully.",
      });
    },
  });

  const resetBuilder = () => {
    setReportName('');
    setReportDescription('');
    setWidgets([]);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setReportName(template.name);
    setReportDescription(template.description);
    setWidgets([...template.widgets]);
  };

  const handleOneClickGenerate = (template: ReportTemplate) => {
    const reportData = {
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      template: template.id,
      widgets: template.widgets,
      config: {
        layout: 'grid',
        theme: 'default',
        exportFormats: ['pdf', 'csv']
      }
    };

    createReportMutation.mutate(reportData);
  };

  const addWidget = (widgetType: any) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType.type,
      title: widgetType.label,
      position: { x: 0, y: widgets.length },
      size: { width: 1, height: 1 },
      config: {
        chartType: widgetType.type === 'chart' ? 'bar' : undefined,
        dataSource: 'sales',
        metric: 'revenue'
      }
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleCreateReport = () => {
    if (!reportName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a report name.",
        variant: "destructive"
      });
      return;
    }

    const reportData = {
      name: reportName,
      description: reportDescription,
      template: selectedTemplate?.id || 'custom',
      widgets: widgets,
      config: {
        layout: 'grid',
        theme: 'default',
        exportFormats: ['pdf', 'csv']
      }
    };

    createReportMutation.mutate(reportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Report Builder</h2>
          <p className="text-muted-foreground">Create custom reports with drag-and-drop widgets</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#fd7014] hover:bg-[#e5640f] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Template Gallery
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => setShowCustomBuilder(true)}
            variant="outline"
            className="border-[#fd7014] text-[#fd7014] hover:bg-[#fd7014] hover:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Custom Builder
          </Button>
        </div>
      </div>

      {/* Custom Report Builder Canvas */}
      <ReportBuilderCanvas 
        isOpen={showCustomBuilder} 
        onClose={() => setShowCustomBuilder(false)} 
      />

      {/* Template Gallery */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PREDEFINED_TEMPLATES.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <Badge>{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOneClickGenerate(template)}
                    disabled={createReportMutation.isPending}
                    className="flex-1 bg-[#fd7014] hover:bg-[#e5640f] text-white"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Your Reports */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Reports</h3>
        {reports.length === 0 ? (
          <Card>
            <DialogHeader>
              <DialogTitle>Build Custom Report</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Widget Library */}
              <div className="space-y-4">
                <h3 className="font-semibold">Widget Library</h3>
                {WIDGET_TYPES.map((widget) => (
                  <Card
                    key={widget.type}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => addWidget(widget)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <widget.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium text-sm">{widget.label}</div>
                          <div className="text-xs text-muted-foreground">{widget.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Report Canvas */}
              <div className="col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reportDescription">Description</Label>
                  <Textarea
                    id="reportDescription"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe your report..."
                    rows={2}
                  />
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-[300px]">
                  <h4 className="font-medium mb-3">Report Canvas</h4>
                  {widgets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Add widgets from the library to build your report</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {widgets.map((widget) => (
                        <Card key={widget.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Move className="h-4 w-4 text-muted-foreground cursor-move" />
                              <span className="font-medium">{widget.title}</span>
                              <Badge variant="outline">{widget.type}</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWidget(widget.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateReport}
                    disabled={createReportMutation.isPending}
                  >
                    {createReportMutation.isPending ? 'Creating...' : 'Create Report'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Gallery */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PREDEFINED_TEMPLATES.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <Badge>{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOneClickGenerate(template)}
                    disabled={createReportMutation.isPending}
                    className="flex-1 bg-[#fd7014] hover:bg-[#e5640f] text-white"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Your Reports */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Reports</h3>
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No reports created yet</p>
              <p className="text-sm text-muted-foreground">Create your first report using the templates above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report: any) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{report.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                    <Badge variant="outline">{report.template}</Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportReportMutation.mutate({ id: report.id, format: 'pdf' })}
                      disabled={exportReportMutation.isPending}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteReportMutation.mutate(report.id)}
                      disabled={deleteReportMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}