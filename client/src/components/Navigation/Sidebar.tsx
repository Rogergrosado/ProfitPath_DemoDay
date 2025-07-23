import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";
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
  Lock,
} from "lucide-react";

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  path: string;
  locked?: boolean;
  lockReason?: string;
}

function SidebarLink({ icon: Icon, label, path, locked = false, lockReason = "" }: SidebarLinkProps) {
  const [location] = useLocation();
  const isActive = location === path;

  if (locked) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md opacity-50 cursor-not-allowed"
        title={lockReason}
      >
        <Lock className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    );
  }

  return (
    <Link href={path}>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ease-in-out cursor-pointer",
          isActive 
            ? "bg-[#fd7014] text-white font-medium" 
            : "hover:bg-[#37414f] text-gray-300"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { logout } = useAuth();
  const { unlockAdvancedFeatures } = useOnboarding();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Features are unlocked when user has sales data
  const lockReason = "Add sales data first to unlock this feature";

  return (
    <aside className="w-60 h-screen bg-[#222831] flex flex-col justify-between fixed">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#37414f] flex items-center justify-center">
        <img 
          src="/logo-white.png" 
          alt="ProfitPath Logo" 
          className="w-48 h-auto"
          style={{ maxWidth: '192px' }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-6">
        {/* Main Section */}
        <div>
          <p className="text-gray-400 uppercase text-xs px-2 mb-2">Main</p>
          <div className="space-y-1">
            <SidebarLink 
              icon={Home} 
              label="Dashboard" 
              path="/dashboard" 
              locked={!unlockAdvancedFeatures}
              lockReason={lockReason}
            />
            <SidebarLink icon={Search} label="Product Workspace" path="/products" />
            <SidebarLink icon={Package} label="Inventory" path="/inventory" />
            <SidebarLink 
              icon={Target} 
              label="Goals" 
              path="/goals" 
              locked={!unlockAdvancedFeatures}
              lockReason={lockReason}
            />
            <SidebarLink 
              icon={TrendingUp} 
              label="Trophy Room" 
              path="/goals/trophy-room" 
              locked={!unlockAdvancedFeatures}
              lockReason={lockReason}
            />
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <p className="text-gray-400 uppercase text-xs px-2 mb-2">Analytics</p>
          <div className="space-y-1">
            <SidebarLink 
              icon={BarChart3} 
              label="Performance" 
              path="/analytics" 
              locked={!unlockAdvancedFeatures}
              lockReason={lockReason}
            />
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
