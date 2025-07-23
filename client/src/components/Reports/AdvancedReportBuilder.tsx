import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download,
  Eye,
  Trash2,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Table,
  DollarSign,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReportBuilderCanvas } from "./ReportBuilderCanvas";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  widgets: any[];
}

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
        type: 'chart',
        title: 'Revenue Trends',
        position: { x: 1, y: 0 },
        size: { width: 2, height: 2 },
        config: { chartType: 'line', dataSource: 'sales', metric: 'revenue' }
      }
    ]
  },
  {
    id: 'profit-analysis',
    name: 'Profit Analysis Report',
    description: 'Detailed profit margins and cost analysis',
    category: 'Finance',
    tags: ['profit', 'margins', 'costs', 'analysis'],
    widgets: [
      {
        id: '1',
        type: 'kpi',
        title: 'Total Profit',
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        config: { metric: 'totalProfit', dataSource: 'performance', format: 'currency' }
      },
      {
        id: '2',
        type: 'chart',
        title: 'Profit by Category',
        position: { x: 1, y: 0 },
        size: { width: 2, height: 2 },
        config: { chartType: 'pie', dataSource: 'performance', metric: 'profit' }
      }
    ]
  }
];

export function AdvancedReportBuilder() {
  const { toast } = useToast();
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports", reportTypeFilter],
  });

  // Filter reports on frontend as backup
  const filteredReports = Array.isArray(reports) ? reports.filter(report => 
    reportTypeFilter === "all" || report.type === reportTypeFilter
  ) : [];

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
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
        description: "Your report has been generated successfully.",
      });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Deleted",
        description: "Report has been removed successfully.",
      });
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: async ({ id, format }: { id: number; format: string }) => {
      const response = await fetch(`/api/reports/${id}/export?format=${format}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to export report');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export Ready",
        description: `Report exported as ${data.format.toUpperCase()} successfully.`,
      });
    },
  });

  const handleOneClickGenerate = (template: ReportTemplate) => {
    const reportData = {
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      type: template.category.toLowerCase(), // Required by backend schema
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Report Builder</h2>
          <p className="text-muted-foreground">Create custom reports with drag-and-drop widgets</p>
        </div>
        <Button 
          onClick={() => setShowCustomBuilder(true)}
          className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Build Custom Report
        </Button>
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
                    size="sm"
                    onClick={() => handleOneClickGenerate(template)}
                    disabled={createReportMutation.isPending}
                    className="flex-1 bg-[#fd7014] hover:bg-[#e5640f] text-white"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {createReportMutation.isPending ? 'Creating...' : 'Generate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Your Reports */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Your Reports</h3>
          <select
            value={reportTypeFilter}
            onChange={(e) => setReportTypeFilter(e.target.value)}
            className="bg-background border border-gray-300 dark:border-gray-700 text-foreground p-2 rounded-md"
          >
            <option value="all">All Reports</option>
            <option value="inventory">Inventory</option>
            <option value="sales">Sales</option>
            <option value="finance">Finance</option>
            <option value="goals">Goals</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {!Array.isArray(filteredReports) || filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No reports created yet.</p>
              <Button 
                onClick={() => setShowCustomBuilder(true)}
                variant="outline" 
                className="mt-4"
              >
                Create Your First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report: any) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <Badge variant="secondary">{report.template}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
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