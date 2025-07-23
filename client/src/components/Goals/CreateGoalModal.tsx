import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Target, DollarSign, Package, TrendingUp, Percent } from "lucide-react";

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGoalModal({ open, onOpenChange }: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    metric: "",
    targetValue: "",
    scope: "global",
    targetCategory: "",
    targetSKU: "",
    period: "30d",
    description: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory"],
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Goal created successfully",
        description: "Your new goal is now being tracked.",
      });
      onOpenChange(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create goal",
        description: error.message || "Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      metric: "",
      targetValue: "",
      scope: "global",
      targetCategory: "",
      targetSKU: "",
      period: "30d",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.metric || !formData.targetValue) {
      toast({
        title: "Missing required fields",
        description: "Please select a metric and enter a target value.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.targetValue) <= 0) {
      toast({
        title: "Invalid target value",
        description: "Target value must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (formData.scope === "category" && !formData.targetCategory) {
      toast({
        title: "Category required",
        description: "Please select a target category.",
        variant: "destructive",
      });
      return;
    }

    if (formData.scope === "sku" && !formData.targetSKU) {
      toast({
        title: "SKU required",
        description: "Please select a target SKU.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      ...formData,
      targetValue: formData.targetValue, // Keep as string, backend will handle conversion
      isActive: true,
    });
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'revenue': return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'unitsSold': return <Package className="h-5 w-5 text-blue-500" />;
      case 'profit': return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'profitMargin': return <Percent className="h-5 w-5 text-orange-500" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'revenue':
      case 'profit':
        return '$';
      case 'unitsSold':
        return 'units';
      case 'profitMargin':
        return '%';
      default:
        return '';
    }
  };

  const categories = Array.from(new Set(inventoryItems.map((item: any) => item.category).filter(Boolean)));
  const skus = inventoryItems.map((item: any) => ({ sku: item.sku, name: item.name }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <Target className="h-5 w-5 mr-2 text-[#fd7014]" />
            Create New Goal
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Set a business objective to track your progress toward specific targets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metric Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-black dark:text-white">Select Metric</Label>
            <RadioGroup 
              value={formData.metric} 
              onValueChange={(value) => setFormData({ ...formData, metric: value })}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                <RadioGroupItem value="revenue" id="revenue" />
                <Label htmlFor="revenue" className="flex items-center cursor-pointer text-black dark:text-white">
                  <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                  Revenue
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                <RadioGroupItem value="unitsSold" id="unitsSold" />
                <Label htmlFor="unitsSold" className="flex items-center cursor-pointer text-black dark:text-white">
                  <Package className="h-5 w-5 text-blue-500 mr-2" />
                  Units Sold
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                <RadioGroupItem value="profit" id="profit" />
                <Label htmlFor="profit" className="flex items-center cursor-pointer text-black dark:text-white">
                  <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                  Profit
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                <RadioGroupItem value="profitMargin" id="profitMargin" />
                <Label htmlFor="profitMargin" className="flex items-center cursor-pointer text-black dark:text-white">
                  <Percent className="h-5 w-5 text-orange-500 mr-2" />
                  Profit Margin
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Target Value */}
          <div>
            <Label htmlFor="targetValue" className="text-black dark:text-white">Target Value</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 flex items-center">
                {getMetricIcon(formData.metric)}
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {getMetricUnit(formData.metric)}
                </span>
              </div>
              <Input
                id="targetValue"
                type="number"
                step={formData.metric === 'profitMargin' ? '0.1' : '0.01'}
                min="0"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                placeholder={`Enter target ${formData.metric || 'value'}`}
                className="pl-16 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                required
              />
            </div>
            {formData.metric && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formData.metric === 'revenue' && 'Total revenue you want to achieve'}
                {formData.metric === 'unitsSold' && 'Number of units you want to sell'}
                {formData.metric === 'profit' && 'Total profit you want to generate'}
                {formData.metric === 'profitMargin' && 'Profit margin percentage you want to maintain'}
              </div>
            )}
          </div>

          {/* Scope Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-black dark:text-white">Goal Scope</Label>
            <RadioGroup 
              value={formData.scope} 
              onValueChange={(value) => setFormData({ ...formData, scope: value, targetCategory: "", targetSKU: "" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="global" id="global" />
                <Label htmlFor="global" className="text-black dark:text-white">Global (All products)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category" id="category" />
                <Label htmlFor="category" className="text-black dark:text-white">Category specific</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sku" id="sku" />
                <Label htmlFor="sku" className="text-black dark:text-white">Single product (SKU)</Label>
              </div>
            </RadioGroup>

            {/* Category Selection */}
            {formData.scope === "category" && (
              <div>
                <Label htmlFor="targetCategory" className="text-black dark:text-white">Target Category</Label>
                <Select value={formData.targetCategory} onValueChange={(value) => setFormData({ ...formData, targetCategory: value })}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* SKU Selection */}
            {formData.scope === "sku" && (
              <div>
                <Label htmlFor="targetSKU" className="text-black dark:text-white">Target SKU</Label>
                <Select value={formData.targetSKU} onValueChange={(value) => setFormData({ ...formData, targetSKU: value })}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                    <SelectValue placeholder="Select SKU" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                    {skus.map((item) => (
                      <SelectItem key={item.sku} value={item.sku}>
                        {item.sku} - {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Time Period */}
          <div>
            <Label htmlFor="period" className="text-black dark:text-white">Time Period</Label>
            <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
              <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="180d">6 Months</SelectItem>
                <SelectItem value="365d">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-black dark:text-white">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional context or motivation for this goal..."
              className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              rows={3}
            />
          </div>

          {/* Preview */}
          {formData.metric && formData.targetValue && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Goal Preview</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p>
                  <strong>Target:</strong> {getMetricUnit(formData.metric)}{formData.targetValue} in {formData.metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  {formData.scope !== 'global' && (
                    <span>
                      {formData.scope === 'category' && formData.targetCategory && ` for ${formData.targetCategory} category`}
                      {formData.scope === 'sku' && formData.targetSKU && ` for SKU ${formData.targetSKU}`}
                    </span>
                  )}
                </p>
                <p><strong>Timeframe:</strong> {formData.period.replace('d', ' days')}</p>
                <p><strong>Scope:</strong> {formData.scope === 'global' ? 'All products' : formData.scope}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !formData.metric || !formData.targetValue}
              className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
            >
              {createMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}