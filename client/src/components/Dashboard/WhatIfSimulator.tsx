import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, RotateCcw, Lightbulb } from 'lucide-react';

interface SimulationResult {
  revenue: number;
  profit: number;
  units: number;
  profitMargin: number;
  roiChange: number;
}

export function WhatIfSimulator() {
  // Current baseline values
  const baselineData = {
    averageOrderValue: 120,
    conversionRate: 3.5,
    monthlyTraffic: 10000,
    costPerAcquisition: 25,
    costOfGoods: 0.6, // 60% of revenue
    currentRevenue: 42000,
    currentProfit: 16800
  };

  // Simulation parameters
  const [priceChange, setPriceChange] = useState([0]); // -50% to +50%
  const [trafficChange, setTrafficChange] = useState([0]); // -50% to +100%
  const [conversionChange, setConversionChange] = useState([0]); // -50% to +100%
  const [costChange, setCostChange] = useState([0]); // -50% to +50%

  // Calculate simulation results
  const simulationResult: SimulationResult = useMemo(() => {
    const newPrice = baselineData.averageOrderValue * (1 + priceChange[0] / 100);
    const newTraffic = baselineData.monthlyTraffic * (1 + trafficChange[0] / 100);
    const newConversion = baselineData.conversionRate * (1 + conversionChange[0] / 100);
    const newCostOfGoods = baselineData.costOfGoods * (1 + costChange[0] / 100);

    const units = (newTraffic * newConversion) / 100;
    const revenue = units * newPrice;
    const cogs = revenue * newCostOfGoods;
    const marketingCost = units * baselineData.costPerAcquisition;
    const profit = revenue - cogs - marketingCost;
    const profitMargin = (profit / revenue) * 100;
    
    const revenueChange = ((revenue - baselineData.currentRevenue) / baselineData.currentRevenue) * 100;
    const profitChange = ((profit - baselineData.currentProfit) / baselineData.currentProfit) * 100;

    return {
      revenue,
      profit,
      units: Math.round(units),
      profitMargin,
      roiChange: profitChange
    };
  }, [priceChange, trafficChange, conversionChange, costChange]);

  const resetSimulation = () => {
    setPriceChange([0]);
    setTrafficChange([0]);
    setConversionChange([0]);
    setCostChange([0]);
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (value: number) => {
    return value >= 0 ? '+' : '';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${getChangeIcon(value)}${value.toFixed(1)}%`;
  };

  // Scenario suggestions
  const scenarios = [
    {
      name: "Premium Pricing",
      changes: { price: 25, traffic: 0, conversion: -10, cost: 0 },
      description: "Increase prices, expect some conversion drop"
    },
    {
      name: "Growth Focus",
      changes: { price: 0, traffic: 50, conversion: 0, cost: 0 },
      description: "Increase marketing spend to drive traffic"
    },
    {
      name: "Optimization",
      changes: { price: 0, traffic: 0, conversion: 20, cost: -10 },
      description: "Improve conversion and reduce costs"
    }
  ];

  const applyScenario = (scenario: any) => {
    setPriceChange([scenario.changes.price]);
    setTrafficChange([scenario.changes.traffic]);
    setConversionChange([scenario.changes.conversion]);
    setCostChange([scenario.changes.cost]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle className="text-card-foreground">What-If Scenario Simulator</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              className="bg-card border-border text-card-foreground hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Adjust Parameters
              </h3>

              {/* Price Change */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    Price Change
                  </label>
                  <Badge variant="outline" className="bg-card text-card-foreground">
                    {formatPercentage(priceChange[0])}
                  </Badge>
                </div>
                <Slider
                  value={priceChange}
                  onValueChange={setPriceChange}
                  max={50}
                  min={-50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-50%</span>
                  <span>+50%</span>
                </div>
              </div>

              {/* Traffic Change */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    Traffic Change
                  </label>
                  <Badge variant="outline" className="bg-card text-card-foreground">
                    {formatPercentage(trafficChange[0])}
                  </Badge>
                </div>
                <Slider
                  value={trafficChange}
                  onValueChange={setTrafficChange}
                  max={100}
                  min={-50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-50%</span>
                  <span>+100%</span>
                </div>
              </div>

              {/* Conversion Change */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    Conversion Rate Change
                  </label>
                  <Badge variant="outline" className="bg-card text-card-foreground">
                    {formatPercentage(conversionChange[0])}
                  </Badge>
                </div>
                <Slider
                  value={conversionChange}
                  onValueChange={setConversionChange}
                  max={100}
                  min={-50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-50%</span>
                  <span>+100%</span>
                </div>
              </div>

              {/* Cost Change */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    Cost of Goods Change
                  </label>
                  <Badge variant="outline" className="bg-card text-card-foreground">
                    {formatPercentage(costChange[0])}
                  </Badge>
                </div>
                <Slider
                  value={costChange}
                  onValueChange={setCostChange}
                  max={50}
                  min={-50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-50%</span>
                  <span>+50%</span>
                </div>
              </div>

              {/* Quick Scenarios */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-card-foreground">
                    Quick Scenarios
                  </span>
                </div>
                <div className="space-y-2">
                  {scenarios.map((scenario, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => applyScenario(scenario)}
                      className="w-full justify-start bg-card border-border text-card-foreground hover:bg-muted"
                    >
                      <div className="text-left">
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {scenario.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Projected Results
              </h3>

              {/* Result Cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  key={`revenue-${simulationResult.revenue}`}
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-muted rounded-lg"
                >
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {formatCurrency(simulationResult.revenue)}
                  </p>
                  <p className={`text-sm ${getChangeColor(
                    ((simulationResult.revenue - baselineData.currentRevenue) / baselineData.currentRevenue) * 100
                  )}`}>
                    {formatPercentage(
                      ((simulationResult.revenue - baselineData.currentRevenue) / baselineData.currentRevenue) * 100
                    )}
                  </p>
                </motion.div>

                <motion.div
                  key={`profit-${simulationResult.profit}`}
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-muted rounded-lg"
                >
                  <p className="text-sm text-muted-foreground">Monthly Profit</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {formatCurrency(simulationResult.profit)}
                  </p>
                  <p className={`text-sm ${getChangeColor(simulationResult.roiChange)}`}>
                    {formatPercentage(simulationResult.roiChange)}
                  </p>
                </motion.div>

                <motion.div
                  key={`units-${simulationResult.units}`}
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-muted rounded-lg"
                >
                  <p className="text-sm text-muted-foreground">Units Sold</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {simulationResult.units.toLocaleString()}
                  </p>
                  <p className={`text-sm ${getChangeColor(
                    ((simulationResult.units - 350) / 350) * 100
                  )}`}>
                    {formatPercentage(((simulationResult.units - 350) / 350) * 100)}
                  </p>
                </motion.div>

                <motion.div
                  key={`margin-${simulationResult.profitMargin}`}
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-muted rounded-lg"
                >
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {simulationResult.profitMargin.toFixed(1)}%
                  </p>
                  <p className={`text-sm ${getChangeColor(simulationResult.profitMargin - 40)}`}>
                    {formatPercentage(simulationResult.profitMargin - 40)}
                  </p>
                </motion.div>
              </div>

              {/* Insights */}
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <p className="font-medium text-blue-800 dark:text-blue-300">
                    Simulation Insight
                  </p>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {simulationResult.roiChange > 10 
                    ? "This scenario shows strong profit growth potential. Consider implementing gradually."
                    : simulationResult.roiChange > 0
                    ? "Modest improvement expected. Monitor closely if implemented."
                    : "This scenario may reduce profitability. Consider alternative strategies."
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}