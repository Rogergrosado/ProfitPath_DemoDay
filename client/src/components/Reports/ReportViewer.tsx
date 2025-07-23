import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Download, FileText } from "lucide-react";
import { KPIWidget } from "./widgets/KPIWidget";
import { ChartWidget } from "./widgets/ChartWidget";
import { TableWidget } from "./widgets/TableWidget";

interface ReportViewerProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: () => void;
  onExportCSV: () => void;
}

export function ReportViewer({ report, isOpen, onClose, onDownloadPDF, onExportCSV }: ReportViewerProps) {
  if (!report) return null;

  const widgets = JSON.parse(report.widgets || '[]');
  const config = JSON.parse(report.config || '{}');

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'kpi':
        return <KPIWidget key={widget.id} widget={widget} />;
      case 'chart':
        return <ChartWidget key={widget.id} widget={widget} />;
      case 'table':
        return <TableWidget key={widget.id} widget={widget} />;
      default:
        return (
          <Card key={widget.id}>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>Unknown widget type: {widget.type}</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{report.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{report.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{report.type}</Badge>
                <Badge variant="outline">{report.template || 'custom'}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCSV}
              >
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Report Content */}
        <div 
          id={`report-preview-${report.id}`}
          className="bg-white dark:bg-gray-900 p-6 rounded-lg"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {report.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {report.description}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>

          {widgets.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No widgets in this report</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {widgets.map(renderWidget)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}