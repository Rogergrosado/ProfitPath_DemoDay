import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showLabels?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showLabels = true,
  className
}: PaginationProps) {
  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2;
    const pages: (number | 'ellipsis')[] = [];
    
    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
      pages.push(i);
    }

    if (currentPage - delta > 2) {
      pages.unshift('ellipsis');
    }
    if (currentPage + delta < totalPages - 1) {
      pages.push('ellipsis');
    }

    pages.unshift(1);
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages.filter((page, index, arr) => 
      page !== arr[index - 1] && page !== arr[index + 1]
    );
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {showLabels && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          {showLabels && <span className="ml-1">Previous</span>}
        </Button>
        
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div key={`ellipsis-${index}`} className="px-2">
                  <MoreHorizontal className="h-4 w-4 text-slate-500" />
                </div>
              );
            }
            
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  "min-w-[32px]",
                  page === currentPage 
                    ? "bg-[#fd7014] text-white border-[#fd7014] hover:bg-[#fd7014]/90" 
                    : "border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                )}
              >
                {page}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          {showLabels && <span className="mr-1">Next</span>}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | null;
  className?: string;
}

export function SortableTableHeader({
  children,
  onSort,
  sortDirection,
  className
}: TableHeaderProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors",
        className
      )}
      onClick={onSort}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {onSort && (
          <div className="flex flex-col">
            <ChevronLeft 
              className={cn(
                "h-3 w-3 rotate-90 transition-colors",
                sortDirection === 'asc' ? "text-[#fd7014]" : "text-slate-400"
              )} 
            />
            <ChevronLeft 
              className={cn(
                "h-3 w-3 -rotate-90 -mt-1 transition-colors",
                sortDirection === 'desc' ? "text-[#fd7014]" : "text-slate-400"
              )} 
            />
          </div>
        )}
      </div>
    </th>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalItems?: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems
}: PaginationControlsProps) {
  const pageSizeOptions = [5, 10, 20, 50];
  
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {totalItems ? `Showing ${startItem}-${endItem} of ${totalItems} items` : ''}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-sm border border-gray-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 text-black dark:text-white"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showLabels={false}
      />
    </div>
  );
}