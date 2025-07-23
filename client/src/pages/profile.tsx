import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  User,
  Building2,
  Calendar,
  TrendingUp,
  Package,
  Target,
  FileText,
  Activity,
  Settings,
  CheckCircle2,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";

interface UserProfile {
  id: number;
  email: string;
  displayName: string;
  photoURL?: string;
  businessName?: string;
  phone?: string;
  industryType?: string;
  fbaYears?: number;
  avgDailySales?: number;
  defaultLeadTime: number;
  currency: string;
  timezone: string;
  createdAt: string;
}

interface AccountStats {
  inventoryItems: number;
  salesEntries: number;
  goalProgress: number;
  reportsExported: number;
  totalRevenue: number;
  totalProfit: number;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });

  const { data: stats } = useQuery<AccountStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      apiRequest("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
  });

  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const handleEdit = () => {
    setFormData({
      displayName: profile?.displayName || "",
      businessName: profile?.businessName || "",
      phone: profile?.phone || "",
      industryType: profile?.industryType || "",
      fbaYears: profile?.fbaYears || 0,
      avgDailySales: profile?.avgDailySales || 0,
      defaultLeadTime: profile?.defaultLeadTime || 14,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.displayName,
      profile.businessName,
      profile.phone,
      profile.industryType,
      profile.fbaYears,
      profile.avgDailySales,
      profile.defaultLeadTime,
    ];
    const completed = fields.filter(field => field !== null && field !== undefined && field !== "").length;
    return Math.round((completed / fields.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 pl-64">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 pl-64">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your business identity and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Profile {getProfileCompletion()}% complete
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  size="sm"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--orange-primary)]" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[var(--orange-primary)]/20 rounded-full flex items-center justify-center">
                    {profile?.photoURL ? (
                      <img 
                        src={profile.photoURL} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-[var(--orange-primary)]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profile?.displayName}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{profile?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    {isEditing ? (
                      <Input
                        id="displayName"
                        value={formData.displayName || ""}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-slate-600 dark:text-slate-400">{profile?.displayName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-slate-600 dark:text-slate-400">{profile?.phone || "Not provided"}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[var(--orange-primary)]" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    {isEditing ? (
                      <Input
                        id="businessName"
                        value={formData.businessName || ""}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-slate-600 dark:text-slate-400">{profile?.businessName || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="industryType">Industry Type</Label>
                    {isEditing ? (
                      <Select 
                        value={formData.industryType || ""} 
                        onValueChange={(value) => setFormData({ ...formData, industryType: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="home-garden">Home & Garden</SelectItem>
                          <SelectItem value="clothing">Clothing & Accessories</SelectItem>
                          <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                          <SelectItem value="sports">Sports & Outdoors</SelectItem>
                          <SelectItem value="books">Books & Media</SelectItem>
                          <SelectItem value="toys">Toys & Games</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-slate-600 dark:text-slate-400">{profile?.industryType || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="fbaYears">Years Selling on Amazon</Label>
                    {isEditing ? (
                      <Input
                        id="fbaYears"
                        type="number"
                        min="0"
                        max="30"
                        value={formData.fbaYears || ""}
                        onChange={(e) => setFormData({ ...formData, fbaYears: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-slate-600 dark:text-slate-400">{profile?.fbaYears || "Not provided"} years</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="avgDailySales">Average Daily Sales ($)</Label>
                    {isEditing ? (
                      <Input
                        id="avgDailySales"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.avgDailySales || ""}
                        onChange={(e) => setFormData({ ...formData, avgDailySales: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-slate-600 dark:text-slate-400">
                        ${profile?.avgDailySales || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="defaultLeadTime">Default Lead Time (days)</Label>
                    {isEditing ? (
                      <Input
                        id="defaultLeadTime"
                        type="number"
                        min="1"
                        max="365"
                        value={formData.defaultLeadTime || ""}
                        onChange={(e) => setFormData({ ...formData, defaultLeadTime: parseInt(e.target.value) || 14 })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-slate-600 dark:text-slate-400">{profile?.defaultLeadTime} days</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Overview Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[var(--orange-primary)]" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--orange-primary)] mb-2">
                    {getProfileCompletion()}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-[var(--orange-primary)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProfileCompletion()}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {getProfileCompletion() < 100 ? "Complete your profile to unlock personalized features" : "Profile complete!"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[var(--orange-primary)]" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Inventory Items</span>
                  </div>
                  <span className="font-semibold">{stats?.inventoryItems || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Sales Entries</span>
                  </div>
                  <span className="font-semibold">{stats?.salesEntries || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Goal Progress</span>
                  </div>
                  <span className="font-semibold">{stats?.goalProgress || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Reports Exported</span>
                  </div>
                  <span className="font-semibold">{stats?.reportsExported || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Business Performance */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--orange-primary)]" />
                  Business Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</span>
                    <span className="font-semibold text-[var(--orange-primary)]">
                      ${stats?.totalRevenue?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Profit</span>
                    <span className="font-semibold text-green-500">
                      ${stats?.totalProfit?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-slate-500">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}