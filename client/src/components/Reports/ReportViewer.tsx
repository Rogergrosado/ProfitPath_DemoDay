import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, BarChart3, Package, Target } from "lucide-react";
import { getAuthHeaders } from "@/lib/queryClient";

interface ReportViewerProps {
  reportId: number;
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string) => void;
}

export function ReportViewer({ reportId, isOpen, onClose, onExport }: ReportViewerProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports", reportId, "export"],
    queryFn: async () => {
      const response = await fetch(`/api/reports/${reportId}/export?format=preview`, {
        method: 'POST',
        headers: await getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch report data');
      return response.json();
    },
    enabled: isOpen && !!reportId,
  });

  const handleExport = async (format: string) => {
    setExportingFormat(format);
    try {
      await onExport(format);
    } finally {
      setExportingFormat(null);
    }
  };

  const renderWidget = (widget: any) => {
    const iconMap: { [key: string]: any } = {
      inventory: Package,
      sales: BarChart3,
      performance: BarChart3,
      goals: Target,
      default: FileText
    };

    const IconComponent = iconMap[widget.config?.dataSource] || iconMap.default;

    return (
      <Card key={widget.id} className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <IconComponent className="h-5 w-5 text-[#fd7014]" />
            <span>{widget.title}</span>
            <Badge variant="outline" className="ml-auto">
              {widget.type}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {widget.type === 'kpi' && widget.data && (
            <div className="text-center">
              <div className="text-3xl font-bold text-[#fd7014] mb-2">
                {widget.data.formatted || widget.value || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {widget.config?.metric || 'Value'}
              </div>
            </div>
          )}

          {widget.type === 'table' && widget.data && Array.isArray(widget.data) && (
            <div className="overflow-x-auto">
              {widget.data.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(widget.data[0]).map(header => (
                        <th key={header} className="text-left p-2 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {widget.data.slice(0, 5).map((row: any, index: number) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).map((value: any, cellIndex: number) => (
                          <td key={cellIndex} className="p-2">
                            {value?.toString() || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-gray-500">No data available</div>
              )}
              {widget.data.length > 5 && (
                <div className="text-center pt-2 text-sm text-gray-500">
                  Showing 5 of {widget.data.length} rows
                </div>
              )}
            </div>
          )}

          {widget.type === 'chart' && widget.data && Array.isArray(widget.data) && (
            <div className="space-y-2">
              {widget.data.slice(0, 5).map((dataPoint: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-sm">{dataPoint.date || `Item ${index + 1}`}</span>
                  <span className="font-medium text-[#fd7014]">
                    {dataPoint.formatted || dataPoint.revenue || dataPoint.value || 'N/A'}
                  </span>
                </div>
              ))}
              {widget.data.length > 5 && (
                <div className="text-center pt-2 text-sm text-gray-500">
                  Showing 5 of {widget.data.length} data points
                </div>
              )}
            </div>
          )}

          {widget.type === 'progress' && widget.data && Array.isArray(widget.data) && (
            <div className="space-y-3">
              {widget.data.slice(0, 3).map((goal: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                      {goal.progress}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-[#fd7014] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progress || 0, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {goal.current} / {goal.target}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-[#fd7014]" />
            <span>Report Preview</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading report data...</div>
          </div>
        ) : reportData?.data ? (
          <div className="space-y-6">
            {/* Report Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#fd7014]">
                  {reportData.data.name}
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Generated: {new Date(reportData.data.generatedAt).toLocaleString()}</span>
                  </div>
                  <Badge variant="outline">{reportData.data.type}</Badge>
                </div>
                {reportData.data.description && (
                  <div className="text-gray-700 dark:text-gray-300">
                    {reportData.data.description}
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Report Widgets */}
            <div className="space-y-4">
              {reportData.data.widgets?.map(renderWidget) || (
                <div className="text-center py-8 text-gray-500">
                  No widgets configured for this report
                </div>
              )}
            </div>

            {/* Export Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={!!exportingFormat}
              >
                <Download className="h-4 w-4 mr-2" />
                {exportingFormat === 'csv' ? 'Exporting...' : 'Export CSV'}
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                disabled={!!exportingFormat}
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportingFormat === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to load report data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}