import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { ProductTable } from "@/components/Products/ProductTable";
import { AddProductModal } from "@/components/Products/AddProductModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function Products() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f13] text-black dark:text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Product Watchlist</h1>
                <p className="text-gray-600 dark:text-slate-400">Research and validate potential products</p>
              </div>
              <AddProductModal>
                <Button className="bg-[#fd7014] hover:bg-[#e5640f] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </AddProductModal>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)] mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Category</label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="home-garden">Home & Garden</SelectItem>
                      <SelectItem value="sports-outdoors">Sports & Outdoors</SelectItem>
                      <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Price Range</label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="0-25">$0 - $25</SelectItem>
                      <SelectItem value="25-100">$25 - $100</SelectItem>
                      <SelectItem value="100+">$100+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Competition</label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]">
                      <SelectValue placeholder="Any Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">Any Level</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Status</label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[var(--orange-primary)] focus:border-[var(--orange-primary)]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="researching">Researching</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="ready_to_launch">Ready to Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Table */}
          <ProductTable />
        </div>
      </main>
    </div>
  );
}
