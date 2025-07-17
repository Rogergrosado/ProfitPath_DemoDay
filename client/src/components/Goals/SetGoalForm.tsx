import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const goalSchema = z.object({
  category: z.enum(["revenue", "growth", "efficiency", "customer"]),
  description: z.string().min(1, "Goal description is required"),
  targetValue: z.coerce.number().positive("Target value must be positive"),
  unit: z.enum(["dollars", "percentage", "units", "count"]),
  period: z.enum(["monthly", "quarterly", "yearly", "custom"]),
  endDate: z.string().min(1, "End date is required"),
});

type GoalFormData = z.infer<typeof goalSchema>;

export function SetGoalForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      category: "revenue",
      description: "",
      targetValue: 0,
      unit: "dollars",
      period: "monthly",
      endDate: "",
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: GoalFormData) => {
      const now = new Date();
      const endDate = new Date(data.endDate);
      
      return apiRequest("POST", "/api/goals", {
        ...data,
        startDate: now,
        endDate,
        currentValue: 0,
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal created successfully" });
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  const onSubmit = (data: GoalFormData) => {
    createGoalMutation.mutate(data);
  };

  return (
    <Card className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Set New Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Goal Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="efficiency">Efficiency</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Target Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="quarterly">This Quarter</SelectItem>
                      <SelectItem value="yearly">This Year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Goal Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Increase monthly revenue to $75,000"
                        {...field}
                        className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Target Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="75000"
                      {...field}
                      className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="dollars">Dollars ($)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Target Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={createGoalMutation.isPending}
                className="bg-[hsl(20,90%,54%)] hover:bg-orange-400 text-white"
              >
                {createGoalMutation.isPending ? "Creating..." : "Set Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
