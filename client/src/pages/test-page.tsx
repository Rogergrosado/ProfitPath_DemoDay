import { useState } from "react";

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <img 
            src="/attached_assets/5f5c0872-e843-4d1f-a19d-d653d0fa8983_1752855956517.png" 
            alt="ProfitPath" 
            className="h-12 w-auto dark:hidden"
          />
          <img 
            src="/attached_assets/7a80751a-749e-4d0e-8b47-68bb62ac7a9d_1752855949355.png" 
            alt="ProfitPath" 
            className="h-12 w-auto hidden dark:block"
          />
          <h2 className="text-2xl font-bold text-black dark:text-white mt-4">Test Page</h2>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Basic Functionality Test
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This page tests if the React app is working properly.
            </p>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCount(count + 1)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Count: {count}
              </button>
              <button 
                onClick={() => setCount(0)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Navigation Links
            </h2>
            <div className="space-y-2">
              <div>
                <a href="/" className="text-blue-500 hover:text-blue-600 underline">
                  Landing Page
                </a>
              </div>
              <div>
                <a href="/auth" className="text-blue-500 hover:text-blue-600 underline">
                  Authentication
                </a>
              </div>
              <div>
                <a href="/dashboard" className="text-blue-500 hover:text-blue-600 underline">
                  Dashboard
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              System Status
            </h2>
            <div className="space-y-2 text-sm">
              <div className="text-green-600 dark:text-green-400">
                ✓ React App Loading
              </div>
              <div className="text-green-600 dark:text-green-400">
                ✓ State Management Working
              </div>
              <div className="text-green-600 dark:text-green-400">
                ✓ CSS Styling Applied
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}