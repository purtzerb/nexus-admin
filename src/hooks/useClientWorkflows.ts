import { useQuery } from '@tanstack/react-query';

export interface IWorkflowData {
  _id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  department: string;
  executionsCount: number;
  nodesCount: number;
  exceptionsCount: number;
  timeSaved: number;
  moneySaved: number;
}

export function useClientWorkflows() {
  return useQuery<IWorkflowData[]>({
    queryKey: ['clientWorkflows'],
    queryFn: async () => {
      const response = await fetch('/api/client/workflows');
      
      if (!response.ok) {
        throw new Error('Failed to fetch client workflows');
      }
      
      return response.json();
    }
  });
}
