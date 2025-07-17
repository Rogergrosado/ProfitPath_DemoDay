import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { ReportEditor } from "@/components/Reports/ReportEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, DollarSign } from "lucide-react";

export default function Reports() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const reportTemplates = [
    {
      title: "Sales Summary",
      description: "Comprehensive overview of sales performance",
      icon: BarChart3,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
    },
    {
      title: "Inventory Report",
      description: "Current stock levels and reorder alerts",
      icon: Package,
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
    },
    {
      title: "Profit Analysis",
      description: "Detailed profit margins and cost breakdown",
      icon: DollarSign,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--navy)] text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Reports Builder</h1>
            <p className="text-slate-400">Create and customize business reports</p>
          </div>

          {/* Report Templates */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Quick Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reportTemplates.map((template, index) => (
                <Card
                  key={index}
                  className="bg-[var(--charcoal)] border-[var(--slate-custom)] hover:shadow-lg hover:border-[var(--orange-primary)] transition-all duration-200 cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${template.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                      <template.icon className={`${template.iconColor} text-xl h-6 w-6`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{template.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{template.description}</p>
                    <Button className="bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Report Builder */}
          <ReportEditor />
        </div>
      </main>
    </div>
  );
}
