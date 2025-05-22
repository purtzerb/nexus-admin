'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IWorkflowException } from '@/models/WorkflowException';

export interface IWorkflowData {
  _id: string;
  name: string;
}

export interface IWorkflowExceptionData extends IWorkflowException {
  _id: string;
}

interface FetchExceptionsResponse {
  exceptions: IWorkflowExceptionData[];
  workflows: IWorkflowData[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export function useWorkflowExceptions() {
  const [filters, setFilters] = useState({
    workflowId: 'all',
    status: 'all',
    severity: 'all',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Fetch exceptions with filters and pagination
  const fetchExceptions = async (): Promise<FetchExceptionsResponse> => {
    const queryParams = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    });

    if (filters.workflowId !== 'all') {
      queryParams.append('workflowId', filters.workflowId);
    }

    if (filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }

    if (filters.severity !== 'all') {
      queryParams.append('severity', filters.severity);
    }

    const response = await fetch(`/api/client/exceptions?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exceptions');
    }

    const data = await response.json();
    
    // Update pagination info from response
    setPagination({
      ...pagination,
      totalCount: data.pagination.totalCount,
      totalPages: data.pagination.totalPages,
    });

    return data;
  };

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<FetchExceptionsResponse>({
    queryKey: ['exceptions', pagination.page, pagination.limit, filters],
    queryFn: fetchExceptions,
  });

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (data && newPage > data.pagination.totalPages)) {
      return;
    }
    setPagination({ ...pagination, page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination({ ...pagination, page: 1, limit: newLimit });
  };

  const handleWorkflowChange = (workflowId: string) => {
    setFilters({ ...filters, workflowId });
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSeverityChange = (severity: string) => {
    setFilters({ ...filters, severity });
    setPagination({ ...pagination, page: 1 });
  };

  return {
    data,
    isLoading,
    error,
    pagination: {
      ...pagination,
      totalCount: data?.pagination.totalCount || 0,
      totalPages: data?.pagination.totalPages || 0,
    },
    filters,
    actions: {
      handlePageChange,
      handleLimitChange,
      handleWorkflowChange,
      handleStatusChange,
      handleSeverityChange,
      refetch,
    },
  };
}
