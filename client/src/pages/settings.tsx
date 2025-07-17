import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { ProfileSettings } from "@/components/Settings/ProfileSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Building, 
  Plug, 
  Bell, 
  CreditCard,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("profile");

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

  const settingsNavigation = [
    { id: "profile", name: "Profile", icon: User },
    { id: "business", name: "Business Info", icon: Building },
    { id: "integrations", name: "Integrations", icon: Plug },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "billing", name: "Billing", icon: CreditCard },
  ];

  const connectedServices = [
    {
      name: "Amazon MWS",
      status: "connected",
      lastSync: "2 hours ago",
      icon: "🛒",
      color: "bg-orange-500",
    },
    {
      name: "FedEx Shipping",
      status: "connected", 
      lastSync: "1 day ago",
      icon: "📦",
      color: "bg-blue-500",
    },
    {
      name: "Google Analytics",
      status: "disconnected",
      lastSync: null,
      icon: "📊",
      color: "bg-purple-500",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "business":
        return (
          <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-white">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Business Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Tax ID</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]"
                    placeholder="Enter tax ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Business Address</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]"
                    placeholder="Enter business address"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white">
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "integrations":
        return (
          <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-white">Connected Services</h3>
              <div className="space-y-4">
                {connectedServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 ${service.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                        {service.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{service.name}</div>
                        <div className="text-sm text-slate-400">
                          {service.status === "connected" 
                            ? `Connected • Last sync: ${service.lastSync}`
                            : "Not connected"
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        service.status === "connected"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-500/20 text-slate-400"
                      }>
                        {service.status === "connected" ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant={service.status === "connected" ? "outline" : "default"}
                        className={
                          service.status === "connected"
                            ? "text-slate-400 hover:text-white border-slate-600"
                            : "bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white"
                        }
                      >
                        {service.status === "connected" ? (
                          <SettingsIcon className="h-4 w-4" />
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case "notifications":
        return (
          <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-white">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Email Notifications</div>
                    <div className="text-sm text-slate-400">Receive updates via email</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[var(--orange-primary)] border-[var(--orange-primary)] text-white"
                  >
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Low Stock Alerts</div>
                    <div className="text-sm text-slate-400">Get notified when inventory is low</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[var(--orange-primary)] border-[var(--orange-primary)] text-white"
                  >
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Weekly Reports</div>
                    <div className="text-sm text-slate-400">Receive weekly performance summaries</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-400"
                  >
                    Disabled
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "billing":
        return (
          <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-white">Billing & Subscription</h3>
              <div className="space-y-6">
                <div className="p-4 bg-[var(--orange-primary)]/10 border border-[var(--orange-primary)]/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Pro Plan</div>
                      <div className="text-sm text-slate-400">$49/month • Billed monthly</div>
                    </div>
                    <Badge className="bg-[var(--orange-primary)]/20 text-[var(--orange-primary)]">
                      Active
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2 text-white">Payment Method</div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <div className="text-white">•••• •••• •••• 4242</div>
                      <div className="text-xs text-slate-400">Expires 12/25</div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Update Payment
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Download Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f13] text-black dark:text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-slate-400">Manage your account and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
                <CardContent className="p-6">
                  <nav className="space-y-2">
                    {settingsNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left",
                          activeSection === item.id
                            ? "bg-[var(--orange-primary)]/10 border-r-2 border-[var(--orange-primary)] text-white"
                            : "text-slate-400 hover:bg-slate-700 hover:text-white"
                        )}
                      >
                        <item.icon className={cn(
                          "h-4 w-4",
                          activeSection === item.id ? "text-[var(--orange-primary)]" : ""
                        )} />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
