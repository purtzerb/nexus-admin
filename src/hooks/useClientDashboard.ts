import { useQuery } from '@tanstack/react-query';

// Types for client details response
export interface ISolutionsEngineer {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string;
}

export interface IPipelineStep {
  name: string;
  status: 'pending' | 'completed';
  completedDate?: Date;
  order: number;
}

export interface IClientDetails {
  companyName: string;
  companyUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  pipelineProgressCurrentPhase?: string;
  pipelineSteps?: IPipelineStep[];
  assignedSolutionsEngineers: ISolutionsEngineer[];
}

// Types for metrics response
export interface IDashboardMetrics {
  timeSaved: {
    recent: number; // Last 7 days
    total: number;  // All time
  };
  moneySaved: {
    recent: number; // Last 7 days
    total: number;  // All time
  };
  activeWorkflows: number;
}

// Custom hook to fetch client details
export function useClientDetails() {
  return useQuery<IClientDetails>({
    queryKey: ['clientDetails'],
    queryFn: async () => {
      const response = await fetch('/api/client/dashboard/client-details');
      
      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }
      
      return response.json();
    }
  });
}

// Custom hook to fetch dashboard metrics
export function useClientMetrics() {
  return useQuery<IDashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const response = await fetch('/api/client/dashboard/metrics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }
      
      return response.json();
    }
  });
}
