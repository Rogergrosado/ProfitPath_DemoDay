import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      businessName: user?.businessName || "",
      currency: user?.currency || "USD",
      timezone: user?.timezone || "UTC",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiRequest("PUT", "/api/users/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-[var(--orange-primary)] rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {user?.displayName?.charAt(0) || "U"}
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                  >
                    Change Photo
                  </Button>
                  <p className="text-sm text-slate-400 mt-1">JPG, PNG or GIF. Max size 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Display Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          className="bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          {...field}
                          className="bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Business Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Theme</div>
                <div className="text-sm text-slate-400">Choose your preferred interface theme</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-white">Light</span>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--orange-primary)] focus:ring-offset-2 focus:ring-offset-[var(--charcoal)] ${
                    theme === "dark" ? "bg-[var(--orange-primary)]" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 transform ${
                      theme === "dark" ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm text-white">Dark</span>
              </div>
            </div>

            {/* Currency */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Currency</div>
                <div className="text-sm text-slate-400">Default currency for reports</div>
              </div>
              <Select defaultValue={user?.currency || "USD"}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Time Zone</div>
                <div className="text-sm text-slate-400">Used for reports and notifications</div>
              </div>
              <Select defaultValue={user?.timezone || "UTC"}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="UTC">UTC (GMT)</SelectItem>
                  <SelectItem value="America/New_York">EST (UTC-5)</SelectItem>
                  <SelectItem value="America/Chicago">CST (UTC-6)</SelectItem>
                  <SelectItem value="America/Denver">MST (UTC-7)</SelectItem>
                  <SelectItem value="America/Los_Angeles">PST (UTC-8)</SelectItem>
                  <SelectItem value="Europe/London">GMT (UTC+0)</SelectItem>
                  <SelectItem value="Europe/Paris">CET (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
