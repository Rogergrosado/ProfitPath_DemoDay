import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export default function MobileSidebarToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#fd7014] hover:bg-[#e5640f] text-white p-2 rounded-lg shadow-lg transition-colors duration-200"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setOpen(false)}
          />
          
          {/* Drawer */}
          <div
            className="fixed left-0 top-0 h-full w-64 bg-[#222831] transform transition-transform duration-300 ease-in-out shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Sidebar Content */}
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}