import { Link } from "wouter";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureTopBarLayoutProps {
  children: React.ReactNode;
}

export function FeatureTopBarLayout({ children }: FeatureTopBarLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f13] text-black dark:text-white">
      {/* Horizontal Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-[#0d0f13]/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#0d0f13]/60">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          {/* Left Section: Back Button + Logo */}
          <div className="flex items-center space-x-4">
            {/* Back to Landing Button */}
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#fd7014] hover:text-[#e5640f] hover:bg-[#fd7014]/10 border border-[#fd7014]/20 hover:border-[#fd7014]/40 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            {/* ProfitPath Logo */}
            <div className="flex items-center">
              <img
                src="/logo-black.png"
                alt="ProfitPath Logo"
                className="h-8 w-auto dark:hidden"
              />
              <img
                src="/logo-white.png"
                alt="ProfitPath Logo"
                className="h-8 w-auto hidden dark:block"
              />
            </div>
          </div>

          {/* Right Section: Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
