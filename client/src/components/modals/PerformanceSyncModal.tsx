export default function PerformanceSyncModal({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="p-6 bg-[#222831] rounded-2xl text-white shadow-2xl w-[300px] text-center">
        <h2 className="text-xl font-bold mb-2">Updating Performance</h2>
        <p className="text-sm text-gray-300 mb-4">
          Syncing inventory changes to analytics...
        </p>
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin border-4 border-[#fd7014] border-t-transparent rounded-full w-6 h-6" />
          <span className="text-sm text-gray-400">Processing data</span>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          This may take a few moments
        </div>
      </div>
    </div>
  );
}