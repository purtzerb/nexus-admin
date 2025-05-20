import { useQuery } from '@tanstack/react-query';

export interface SearchResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
}

// Generic search function that can be used for any search endpoint
const fetchSearchResults = async <T>(endpoint: string, query: string, limit: number = 5): Promise<T> => {
  if (!query.trim()) {
    return {} as T;
  }
  
  const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Search request failed with status: ${response.status}`);
  }
  
  return response.json();
};

// Hook for searching departments
export const useDepartmentSearch = (query: string, enabled: boolean = true): SearchResult<{ name: string; clientCount?: number }> => {
  // Normalize query to prevent unnecessary re-renders
  const normalizedQuery = query.trim().toLowerCase();
  
  const { data, isLoading, error } = useQuery<{ name: string; clientCount?: number }[]>({
    queryKey: ['departmentSearch', normalizedQuery],
    queryFn: async () => {
      const result = await fetchSearchResults<{ departments: { name: string; clientCount?: number }[] }>(
        '/api/admin/departments/search',
        normalizedQuery
      );
      return result.departments || [];
    },
    enabled: enabled && normalizedQuery.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  });
  
  return {
    data: data || [],
    isLoading,
    error: error as Error || null,
  };
};

// Hook for searching solutions engineers
export const useSolutionsEngineerSearch = (query: string, enabled: boolean = true): SearchResult<{ _id: string; name: string; email: string }> => {
  // Normalize query to prevent unnecessary re-renders
  const normalizedQuery = query.trim().toLowerCase();
  
  const { data, isLoading, error } = useQuery<{ _id: string; name: string; email: string }[]>({
    queryKey: ['solutionsEngineerSearch', normalizedQuery],
    queryFn: async () => {
      const result = await fetchSearchResults<{ users: { _id: string; name: string; email: string }[] }>(
        '/api/admin/solutions-engineers/search',
        normalizedQuery
      );
      return result.users || [];
    },
    enabled: enabled && normalizedQuery.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  });
  
  return {
    data: data || [],
    isLoading,
    error: error as Error || null,
  };
};
