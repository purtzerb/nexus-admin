import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export interface IWorkflowExecutionData {
  _id: string;
  executionId: string;
  workflowId: string;
  clientId: string;
  status: 'SUCCESS' | 'FAILURE';
  details: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkflow {
  _id: string;
  name: string;
}

export interface IPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface IWorkflowExecutionsResponse {
  executions: IWorkflowExecutionData[];
  workflows: IWorkflow[];
  pagination: IPagination;
}

export function useWorkflowExecutions(
  initialPage = 1,
  initialLimit = 20,
  initialWorkflowId = 'all'
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [workflowId, setWorkflowId] = useState(initialWorkflowId);

  const { data, isLoading, error, refetch } = useQuery<IWorkflowExecutionsResponse>({
    queryKey: ['workflowExecutions', page, limit, workflowId],
    queryFn: async () => {
      // Build URL with query parameters
      const url = new URL('/api/client/workflow-executions', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      if (workflowId !== 'all') {
        url.searchParams.append('workflowId', workflowId);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflow executions');
      }
      
      return response.json();
    }
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const handleWorkflowChange = (newWorkflowId: string) => {
    setWorkflowId(newWorkflowId);
    setPage(1); // Reset to first page when changing workflow filter
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    pagination: {
      page,
      limit,
      totalPages: data?.pagination.totalPages || 0,
      totalCount: data?.pagination.totalCount || 0
    },
    filters: {
      workflowId,
    },
    actions: {
      handlePageChange,
      handleLimitChange,
      handleWorkflowChange
    }
  };
}
