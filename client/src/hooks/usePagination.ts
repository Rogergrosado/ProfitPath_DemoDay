import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialOrder?: 'asc' | 'desc';
}

interface PaginationState {
  page: number;
  pageSize: number;
  sortBy: string;
  order: 'asc' | 'desc';
}

interface PaginationResult extends PaginationState {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (sortBy: string, order?: 'asc' | 'desc') => void;
  getQueryParams: () => URLSearchParams;
  reset: () => void;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  initialSortBy = 'name',
  initialOrder = 'asc'
}: UsePaginationOptions = {}): PaginationResult {
  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
    sortBy: initialSortBy,
    order: initialOrder
  });

  const setPage = (page: number) => {
    setState(prev => ({ ...prev, page }));
  };

  const setPageSize = (pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, page: 1 })); // Reset to first page when changing page size
  };

  const setSorting = (sortBy: string, order?: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortBy,
      order: order || (prev.sortBy === sortBy && prev.order === 'asc' ? 'desc' : 'asc'),
      page: 1 // Reset to first page when changing sort
    }));
  };

  const getQueryParams = useMemo(() => {
    return () => {
      const params = new URLSearchParams();
      params.set('page', state.page.toString());
      params.set('limit', state.pageSize.toString());
      params.set('sortBy', state.sortBy);
      params.set('order', state.order);
      return params;
    };
  }, [state]);

  const reset = () => {
    setState({
      page: initialPage,
      pageSize: initialPageSize,
      sortBy: initialSortBy,
      order: initialOrder
    });
  };

  return {
    ...state,
    setPage,
    setPageSize,
    setSorting,
    getQueryParams,
    reset
  };
}

// Hook for managing table data with pagination
export function usePaginatedTable<T>(
  queryKey: string[],
  queryFn: (params: URLSearchParams) => Promise<{
    results: T[];
    nextPage: boolean;
    totalPages: number;
    currentPage: number;
  }>,
  options?: UsePaginationOptions
) {
  const pagination = usePagination(options);
  
  // This would typically use React Query
  // For now, return the pagination controls
  return {
    ...pagination,
    // Additional table-specific functionality can be added here
  };
}