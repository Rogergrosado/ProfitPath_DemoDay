import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Mail, 
  Download, 
  Globe, 
  Shield, 
  Zap,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";

interface UserSettings {
  id: number;
  email: string;
  displayName: string;
  currency: string;
  timezone: string;
  theme: string;
  emailNotifications: boolean;
  inventoryAlerts: boolean;
  goalAlerts: boolean;
  lowStockThreshold: number;
  autoSync: boolean;
  exportFormat: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<UserSettings>) =>
      apiRequest("/api/user/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully saved.",
      });
    },
  });

  const testNotificationMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/test-notification", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Test Alert Sent",
        description: "Check your email for the test notification.",
      });
    },
  });

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    if (settings) {
      const updatedSettings = { ...settings, [key]: value };
      updateSettingsMutation.mutate({ [key]: value });
    }
  };

  const handleTestAlert = () => {
    testNotificationMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 pl-64">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 pl-64">
      <div className="max-w-5xl mx-auto space-y-6">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              System-wide controls and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] border-[var(--orange-primary)]/20">
              Free Plan
            </Badge>
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[var(--orange-primary)]" />
                Notifications & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings?.emailNotifications || false}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <Separator className="bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inventory-alerts">Inventory Alerts</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Low stock and reorder notifications</p>
                </div>
                <Switch
                  id="inventory-alerts"
                  checked={settings?.inventoryAlerts || false}
                  onCheckedChange={(checked) => handleSettingChange("inventoryAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="goal-alerts">Goal Progress Alerts</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Updates on goal achievements</p>
                </div>
                <Switch
                  id="goal-alerts"
                  checked={settings?.goalAlerts || false}
                  onCheckedChange={(checked) => handleSettingChange("goalAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Alert when stock falls below</p>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={settings?.lowStockThreshold || 10}
                    onChange={(e) => handleSettingChange("lowStockThreshold", parseInt(e.target.value) || 10)}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTestAlert}
                  disabled={testNotificationMutation.isPending}
                >
                  {testNotificationMutation.isPending ? "Sending..." : "Test Alert"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[var(--orange-primary)]" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={settings?.currency || "USD"} 
                  onValueChange={(value) => handleSettingChange("currency", value)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={settings?.timezone || "UTC"} 
                  onValueChange={(value) => handleSettingChange("timezone", value)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={settings?.theme || "dark"} 
                  onValueChange={(value) => handleSettingChange("theme", value)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Export & Data */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-[var(--orange-primary)]" />
                Export & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="export-format">Default Export Format</Label>
                <Select 
                  value={settings?.exportFormat || "CSV"} 
                  onValueChange={(value) => handleSettingChange("exportFormat", value)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="XLSX">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">Auto-Sync Data</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Automatically sync with Amazon MWS</p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={settings?.autoSync || false}
                  onCheckedChange={(checked) => handleSettingChange("autoSync", checked)}
                />
              </div>

              <Separator className="bg-slate-200 dark:bg-slate-700" />

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full">
                  Download Report Templates
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security & Account */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[var(--orange-primary)]" />
                Security & Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Change Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Manage Connected Accounts
                </Button>
              </div>

              <Separator className="bg-slate-200 dark:bg-slate-700" />

              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>• Last login: Today at 2:30 PM</p>
                  <p>• Data export: Yesterday</p>
                  <p>• Settings updated: Just now</p>
                </div>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Danger Zone</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Permanently delete your account and all data
                    </p>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => toast({
                        title: "Account Deletion",
                        description: "Please contact support to delete your account.",
                        variant: "destructive",
                      })}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Beta Features */}
          <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[var(--orange-primary)]" />
                Beta Features & Experiments
                <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                  <h4 className="font-medium mb-2">AI Forecast Engine</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Predictive analytics for inventory planning
                  </p>
                  <Switch disabled />
                </div>
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                  <h4 className="font-medium mb-2">Scenario Simulator</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    What-if analysis for business decisions
                  </p>
                  <Switch disabled />
                </div>
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                  <h4 className="font-medium mb-2">Advanced Integrations</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Connect with Shopify, eBay, and more
                  </p>
                  <Switch disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}