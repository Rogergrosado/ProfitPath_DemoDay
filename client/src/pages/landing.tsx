import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import {
  TrendingUp,
  Search,
  Package,
  BarChart3,
  Target,
  DollarSign,
  Users,
  Shield,
  Zap,
} from "lucide-react";

export default function Landing() {
  const [monthlyRevenue, setMonthlyRevenue] = useState([50000]);
  const [profitMargin, setProfitMargin] = useState([25]);
  const [unitsSold, setUnitsSold] = useState([1000]);

  const calculatedProfit = (monthlyRevenue[0] * profitMargin[0]) / 100;
  const profitPerUnit = calculatedProfit / unitsSold[0];

  const features = [
    {
      icon: Search,
      title: "Product Research",
      description: "Validate products before investing with comprehensive market analysis",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels, set reorder points, and manage your FBA inventory",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Monitor sales, profits, and growth with detailed reporting",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and track business goals with visual progress indicators",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--navy)] text-white">
      <ThemeToggle />
      
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-12">
              <img 
                src="/logo-white.png" 
                alt="ProfitPath Logo" 
                className="h-32 w-auto"
              />
            </div>
            
            <h2 className="text-6xl font-bold tracking-tight mb-6">
              Amazon FBA Business
              <span className="gradient-text block">Intelligence Dashboard</span>
            </h2>
            
            <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
              Make data-driven decisions, optimize your inventory, and scale your Amazon FBA business 
              with our comprehensive analytics and management platform.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white px-8 py-3 text-lg"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/auth">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-600 text-white hover:bg-slate-800 px-8 py-3 text-lg"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-3xl font-bold text-center mb-12">
            Everything you need to scale your FBA business
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-[var(--charcoal)] border-[var(--slate-custom)] hover:border-[var(--orange-primary)] transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[var(--orange-primary)]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-[var(--orange-primary)]" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-white">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Profit Calculator */}
      <section className="px-6 lg:px-8 py-24 bg-[var(--charcoal)]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">FBA Profit Calculator</h3>
            <p className="text-slate-400">
              See how much you could be earning with better data and optimization
            </p>
          </div>
          
          <Card className="bg-slate-800 border-slate-600">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-white">
                      Monthly Revenue: ${monthlyRevenue[0].toLocaleString()}
                    </label>
                    <Slider
                      value={monthlyRevenue}
                      onValueChange={setMonthlyRevenue}
                      max={200000}
                      min={10000}
                      step={5000}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-3 text-white">
                      Profit Margin: {profitMargin[0]}%
                    </label>
                    <Slider
                      value={profitMargin}
                      onValueChange={setProfitMargin}
                      max={50}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-3 text-white">
                      Units Sold: {unitsSold[0].toLocaleString()}
                    </label>
                    <Slider
                      value={unitsSold}
                      onValueChange={setUnitsSold}
                      max={5000}
                      min={100}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4 text-white">Projected Results</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Profit:</span>
                      <span className="text-[var(--orange-primary)] font-semibold">
                        ${calculatedProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Profit per Unit:</span>
                      <span className="text-[var(--orange-primary)] font-semibold">
                        ${profitPerUnit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Annual Profit:</span>
                      <span className="text-[var(--orange-primary)] font-semibold">
                        ${(calculatedProfit * 12).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-[var(--orange-primary)]/10 rounded-lg border border-[var(--orange-primary)]/20">
                    <p className="text-sm text-[var(--orange-primary)]">
                      <strong>Potential Increase:</strong> Optimize your business with ProfitPath 
                      and potentially increase profits by 15-30% through better inventory management 
                      and data-driven decisions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Trusted by Amazon FBA Sellers</h3>
            <p className="text-slate-400">Join thousands of sellers optimizing their business</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--orange-primary)] mb-2">2,500+</div>
              <div className="text-slate-400">Active Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--orange-primary)] mb-2">$50M+</div>
              <div className="text-slate-400">Revenue Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--orange-primary)] mb-2">25%</div>
              <div className="text-slate-400">Avg. Profit Increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-8 py-24 bg-[var(--charcoal)]">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to scale your Amazon FBA business?</h3>
          <p className="text-slate-400 mb-8 text-lg">
            Start your free trial today and see the difference data-driven decisions can make.
          </p>
          
          <Link href="/auth">
            <Button 
              size="lg" 
              className="bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white px-12 py-4 text-lg"
            >
              Start Free Trial
            </Button>
          </Link>
          
          <p className="text-sm text-slate-500 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-8 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/logo-white.png" 
                alt="ProfitPath Logo" 
                className="h-10 w-auto"
              />
            </div>
            
            <div className="text-slate-400 text-sm">
              © 2024 All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
