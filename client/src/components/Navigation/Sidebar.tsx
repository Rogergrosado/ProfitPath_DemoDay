import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  Package,
  BarChart3,
  FileText,
  Target,
  Settings,
  TrendingUp,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Product Watchlist", href: "/products", icon: Search },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-[hsl(240,10%,13%)] border-r border-[hsl(240,3.7%,15.9%)] fixed h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-[hsl(20,90%,54%)] rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">ProfitPath</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "bg-[hsl(20,90%,54%)]/10 border-r-2 border-[hsl(20,90%,54%)] text-white"
                      : "text-slate-400 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-[hsl(20,90%,54%)]" : "")} />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
