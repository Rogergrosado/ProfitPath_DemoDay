import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Package,
  Target,
  Calendar,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { AdvancedReportBuilder } from "@/components/Reports/AdvancedReportBuilder";

const REPORT_TEMPLATES = [
  {
    id: "inventory-snapshot",
    name: "Inventory Snapshot",
    description: "Current stock levels, values, and reorder alerts",
    category: "Inventory",
    icon: Package,
    widgets: ["inventory-summary", "low-stock-alerts", "category-breakdown"],
  },
  {
    id: "sales-performance",
    name: "Sales Performance",
    description: "Revenue, profit, and unit sales analysis",
    category: "Sales",
    icon: TrendingUp,
    widgets: ["revenue-chart", "top-products", "category-sales"],
  },
  {
    id: "profit-analysis",
    name: "Profit Analysis",
    description: "Margin analysis and profitability insights",
    category: "Finance",
    icon: BarChart3,
    widgets: ["profit-trends", "margin-by-category", "cost-analysis"],
  },
  {
    id: "goal-tracker",
    name: "Goal Progress Tracker",
    description: "Track progress toward business objectives",
    category: "Goals",
    icon: Target,
    widgets: ["goal-progress", "achievement-summary", "milestone-chart"],
  },
];

const WIDGET_COMPONENTS = [
  { id: "revenue-chart", name: "Revenue Trend Chart", type: "chart", source: "/api/performance/metrics" },
  { id: "profit-trends", name: "Profit Trends", type: "chart", source: "/api/performance/metrics" },
  { id: "inventory-summary", name: "Inventory Summary", type: "kpi", source: "/api/inventory" },
  { id: "low-stock-alerts", name: "Low Stock Alerts", type: "table", source: "/api/inventory" },
  { id: "top-products", name: "Top Products", type: "table", source: "/api/sales" },
  { id: "category-breakdown", name: "Category Breakdown", type: "pie", source: "/api/performance/categories" },
  { id: "goal-progress", name: "Goal Progress", type: "progress", source: "/api/goals" },
  { id: "sales-summary", name: "Sales Summary KPIs", type: "kpi", source: "/api/sales" },
];

export default function Reports() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports"],
    enabled: !!user,
  });

  const createReportMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/reports", data),
    onSuccess: () => {
      toast({ title: "Report created successfully" });
      setCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({ title: "Failed to create report", variant: "destructive" });
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: ({ reportId, format }: { reportId: number; format: string }) =>
      apiRequest("POST", `/api/reports/${reportId}/export?format=${format}`),
    onSuccess: (data, variables) => {
      // In a real app, this would trigger a download
      toast({ title: `Report exported as ${variables.format.toUpperCase()}` });
    },
    onError: () => {
      toast({ title: "Failed to export report", variant: "destructive" });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: (reportId: number) => apiRequest("DELETE", `/api/reports/${reportId}`),
    onSuccess: () => {
      toast({ title: "Report deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({ title: "Failed to delete report", variant: "destructive" });
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d0f13] flex items-center justify-center">
        <div className="text-black dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const resetForm = () => {
    setReportName("");
    setReportDescription("");
    setSelectedTemplate("");
    setDateRange("30d");
  };

  const handleCreateReport = () => {
    if (!reportName || !selectedTemplate) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);
    createReportMutation.mutate({
      name: reportName,
      description: reportDescription,
      type: selectedTemplate,
      templateId: selectedTemplate,
      config: {
        widgets: template?.widgets || [],
        dateRange,
        filters: {},
      },
    });
  };

  const handleExportReport = (reportId: number, format: string) => {
    exportReportMutation.mutate({ reportId, format });
  };

  const handleDeleteReport = (reportId: number) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      deleteReportMutation.mutate(reportId);
    }
  };

  const getReportIcon = (type: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === type);
    const IconComponent = template?.icon || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  const getCategoryBadge = (type: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === type);
    const category = template?.category || "Custom";
    
    const categoryColors = {
      Inventory: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      Sales: "bg-green-500/20 text-green-600 dark:text-green-400",
      Finance: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      Goals: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
      Custom: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
    };

    return (
      <Badge className={categoryColors[category as keyof typeof categoryColors] || categoryColors.Custom}>
        {category}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f13] text-black dark:text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          <AdvancedReportBuilder />
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Business Reports</h1>
                <p className="text-gray-600 dark:text-slate-400">
                  Create, customize, and export business intelligence reports
                </p>
              </div>
              <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#fd7014] hover:bg-[#e5640f] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-black dark:text-white">Create New Report</DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                      Choose a template and customize your business report
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reportName" className="text-black dark:text-white">Report Name</Label>
                        <Input
                          id="reportName"
                          value={reportName}
                          onChange={(e) => setReportName(e.target.value)}
                          placeholder="Monthly Sales Report"
                          className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateRange" className="text-black dark:text-white">Date Range</Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reportDescription" className="text-black dark:text-white">Description (Optional)</Label>
                      <Textarea
                        id="reportDescription"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Describe what this report is for..."
                        className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-black dark:text-white mb-3 block">Choose Template</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {REPORT_TEMPLATES.map((template) => {
                          const IconComponent = template.icon;
                          return (
                            <button
                              key={template.id}
                              onClick={() => setSelectedTemplate(template.id)}
                              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                selectedTemplate === template.id
                                  ? "border-[#fd7014] bg-orange-50 dark:bg-orange-900/20"
                                  : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                              }`}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <IconComponent className={`h-5 w-5 ${
                                  selectedTemplate === template.id ? "text-[#fd7014]" : "text-gray-500 dark:text-gray-400"
                                }`} />
                                <span className={`font-medium ${
                                  selectedTemplate === template.id ? "text-[#fd7014]" : "text-black dark:text-white"
                                }`}>
                                  {template.name}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {template.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setCreateModalOpen(false)}
                        className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateReport}
                        disabled={createReportMutation.isPending || !reportName || !selectedTemplate}
                        className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                      >
                        {createReportMutation.isPending ? "Creating..." : "Create Report"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Template Gallery */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Report Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {REPORT_TEMPLATES.map((template) => {
                const IconComponent = template.icon;
                return (
                  <Card key={template.id} className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-[#fd7014]/10 dark:bg-[#fd7014]/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-[#fd7014]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-black dark:text-white">{template.name}</h3>
                          <Badge className="bg-gray-500/20 text-gray-600 dark:text-gray-400 text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {template.description}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setReportName(template.name);
                          setCreateModalOpen(true);
                        }}
                        className="w-full bg-[#fd7014] hover:bg-[#e5640f] text-white"
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Reports */}
          <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Your Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first report using one of the templates above.
                  </p>
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-slate-700">
                      <TableHead className="text-black dark:text-white">Report</TableHead>
                      <TableHead className="text-black dark:text-white">Type</TableHead>
                      <TableHead className="text-black dark:text-white">Created</TableHead>
                      <TableHead className="text-black dark:text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report: any) => (
                      <TableRow key={report.id} className="border-gray-200 dark:border-slate-700">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#fd7014]/10 dark:bg-[#fd7014]/20 rounded-lg flex items-center justify-center">
                              {getReportIcon(report.type)}
                            </div>
                            <div>
                              <div className="font-medium text-black dark:text-white">{report.name}</div>
                              {report.description && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">{report.description}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCategoryBadge(report.type)}
                        </TableCell>
                        <TableCell className="text-black dark:text-white">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportReport(report.id, 'pdf')}
                              className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportReport(report.id, 'csv')}
                              className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteReport(report.id)}
                              className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}