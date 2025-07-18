import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  Package,
  BarChart3,
  FileText,
  Target,
  Settings,
  User,
  LogOut,
  TrendingUp,
} from "lucide-react";

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  path: string;
}

function SidebarLink({ icon: Icon, label, path }: SidebarLinkProps) {
  const [location] = useLocation();
  const isActive = location === path;

  return (
    <Link href={path}>
      <a
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ease-in-out",
          isActive 
            ? "bg-[#fd7014] text-white font-medium" 
            : "hover:bg-[#37414f] text-gray-300"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </a>
    </Link>
  );
}

export function Sidebar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-60 h-screen bg-[#222831] flex flex-col justify-between fixed">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#37414f] flex items-center justify-center">
        <img 
          src="/attached_assets/7a80751a-749e-4d0e-8b47-68bb62ac7a9d_1752855949355.png" 
          alt="ProfitPath" 
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-6">
        {/* Main Section */}
        <div>
          <p className="text-gray-400 uppercase text-xs px-2 mb-2">Main</p>
          <div className="space-y-1">
            <SidebarLink icon={Home} label="Dashboard" path="/dashboard" />
            <SidebarLink icon={Search} label="Product Workspace" path="/products" />
            <SidebarLink icon={Package} label="Inventory" path="/inventory" />
            <SidebarLink icon={Target} label="Goals" path="/goals" />
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <p className="text-gray-400 uppercase text-xs px-2 mb-2">Analytics</p>
          <div className="space-y-1">
            <SidebarLink icon={BarChart3} label="Performance" path="/analytics" />
            <SidebarLink icon={FileText} label="Reports" path="/reports" />
          </div>
        </div>

        {/* Account Section */}
        <div>
          <p className="text-gray-400 uppercase text-xs px-2 mb-2">Account</p>
          <div className="space-y-1">
            <SidebarLink icon={User} label="Profile" path="/profile" />
            <SidebarLink icon={Settings} label="Settings" path="/settings" />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#37414f]">
        <button 
          onClick={handleLogout}
          className="w-full text-left text-gray-300 hover:bg-[#37414f] rounded-md px-3 py-2 transition-all duration-200 ease-in-out flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
