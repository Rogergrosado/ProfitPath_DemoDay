import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Table, PieChart, Gauge, Save, Eye, FileText, Download } from "lucide-react";

const widgets = [
  { id: "revenue-chart", name: "Revenue Chart", icon: BarChart3 },
  { id: "data-table", name: "Data Table", icon: Table },
  { id: "pie-chart", name: "Pie Chart", icon: PieChart },
  { id: "kpi-card", name: "KPI Card", icon: Gauge },
];

export function ReportEditor() {
  return (
    <Card className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Custom Report Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Widget Palette */}
          <div className="lg:col-span-1">
            <h3 className="font-medium mb-3 text-white">Available Widgets</h3>
            <div className="space-y-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                  draggable
                >
                  <div className="flex items-center space-x-2">
                    <widget.icon className="h-4 w-4 text-[hsl(20,90%,54%)]" />
                    <span className="text-sm text-white">{widget.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-lg p-6 min-h-96 border-2 border-dashed border-slate-600">
              <div className="text-center text-slate-400">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                </div>
                <p className="text-lg mb-2">Drag widgets here to build your report</p>
                <p className="text-sm">Create custom dashboards by combining charts, tables, and KPI cards</p>
              </div>
            </div>
            
            {/* Export Options */}
            <div className="flex justify-between items-center mt-6">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
                <Button
                  variant="outline"
                  className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button className="bg-red-600 hover:bg-red-500 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button className="bg-green-600 hover:bg-green-500 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
