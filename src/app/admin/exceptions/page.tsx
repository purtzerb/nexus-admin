'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PageHeader from '@/components/shared/PageHeader';
import SearchableSelect, { Option } from '@/components/shared/inputs/SearchableSelect';

interface Department {
  _id: string;
  name: string;
}

interface Workflow {
  _id: string;
  name: string;
  departmentId?: Department;
  clientId: string;
}

interface Client {
  _id: string;
  companyName: string;
}

interface Exception {
  _id: string;
  exceptionId: string;
  workflowId: Workflow;
  clientId: Client;
  exceptionType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  remedy?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

interface Client {
  _id: string;
  companyName: string;
}

interface PaginatedResponse {
  exceptions: Exception[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// Fetch exceptions with filtering and pagination
const fetchExceptions = async ({
  page = 1,
  limit = 10,
  clientId = 'all',
  exceptionType = 'all',
  severity = 'all'
}: {
  page?: number;
  limit?: number;
  clientId?: string;
  exceptionType?: string;
  severity?: string;
}): Promise<PaginatedResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  if (clientId !== 'all') {
    queryParams.append('clientId', clientId);
  }

  if (exceptionType !== 'all') {
    queryParams.append('exceptionType', exceptionType);
  }

  if (severity !== 'all') {
    queryParams.append('severity', severity);
  }

  const url = `/api/admin/exceptions?${queryParams}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch exceptions');
  }
  const data = await response.json();

  return {
    exceptions: data.exceptions || [],
    totalCount: data.totalCount || 0,
    page: data.page || 1,
    totalPages: data.totalPages || 0
  };
};

// Search clients function for SearchableSelect using API endpoint
const searchClients = async (query: string): Promise<Option[]> => {
  try {
    // Construct query parameters
    const params = new URLSearchParams();
    if (query.trim()) {
      params.append('query', query);
    }
    params.append('limit', '5'); // Limit to 5 results

    // Call the search API endpoint
    const response = await fetch(`/api/admin/clients/search?${params}`);

    if (!response.ok) {
      throw new Error('Failed to search clients');
    }

    const data = await response.json();

    // Map the results to the Option format
    return (data.clients || []).map((client: Client) => ({
      value: client._id,
      label: client.companyName
    }));
  } catch (error) {
    console.error('Error searching clients:', error);
    showToast('Failed to search clients', 'error');
    return [];
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};

// Get severity class for styling
const getSeverityClass = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get status class for styling
const getStatusClass = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'RESOLVED':
      return 'bg-green-100 text-green-800';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ExceptionsPage() {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState('all');
  const [selectedExceptionType, setSelectedExceptionType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [initialClients, setInitialClients] = useState<Option[]>([]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClientId, selectedExceptionType, selectedSeverity]);
  
  // Fetch initial clients on component mount
  useEffect(() => {
    const fetchInitialClients = async () => {
      try {
        const results = await searchClients('');
        setInitialClients(results);
      } catch (error) {
        console.error('Error fetching initial clients:', error);
      }
    };
    
    fetchInitialClients();
  }, []);

  // Fetch exceptions with filtering and pagination
  const {
    data: paginatedData,
    isLoading,
    isError,
    refetch
  } = useQuery<PaginatedResponse>({
    queryKey: ['exceptions', currentPage, pageSize, selectedClientId, selectedExceptionType, selectedSeverity],
    queryFn: () => fetchExceptions({
      page: currentPage,
      limit: pageSize,
      clientId: selectedClientId,
      exceptionType: selectedExceptionType,
      severity: selectedSeverity
    }),
    placeholderData: (prevData) => prevData,
  });

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  // Update exception status mutation
  const updateExceptionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' }) => {
      const response = await fetch(`/api/admin/exceptions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update exception status');
      }

      return response.json();
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['exceptions'] });
      
      // Get the current query data
      const previousData = queryClient.getQueryData(['exceptions', {
        clientId: selectedClientId,
        exceptionType: selectedExceptionType,
        severity: selectedSeverity,
        page: currentPage,
        limit: pageSize
      }]);
      
      // Optimistically update the exception status in the UI
      queryClient.setQueryData(['exceptions', {
        clientId: selectedClientId,
        exceptionType: selectedExceptionType,
        severity: selectedSeverity,
        page: currentPage,
        limit: pageSize
      }], (old: any) => {
        if (!old || !old.exceptions) return old;
        
        return {
          ...old,
          exceptions: old.exceptions.map((exception: Exception) => 
            exception._id === id ? { ...exception, status } : exception
          ),
        };
      });
      
      // Return previous data for rollback in case of error
      return { previousData };
    },
    onSuccess: () => {
      showToast('Exception status updated successfully', 'success');
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to the previous data if available
      if (context?.previousData) {
        queryClient.setQueryData(['exceptions', {
          clientId: selectedClientId,
          exceptionType: selectedExceptionType,
          severity: selectedSeverity,
          page: currentPage,
          limit: pageSize
        }], context.previousData);
      }
      handleApiError(error, 'Failed to update exception status');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['exceptions'] });
    },
  });

  // Function to update exception status
  const updateExceptionStatus = ({ id, status }: { id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' }) => {
    updateExceptionMutation.mutate({ id, status });
  };

  return (
    <div className="h-full bg-darkerBackground">
      <PageHeader pageTitle="Exceptions" />
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-cardBackground shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Filter Exceptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="clientFilter" className="block text-sm font-medium text-gray-700 mb-1">Client name</label>
                <SearchableSelect
                value={selectedClientId}
                onChange={(value) => {
                  setSelectedClientId(value);
                }}
                onSearch={searchClients}
                placeholder="Search for a client..."
                emptyMessage="No clients found"
                initialOptions={[{ value: 'all', label: 'All clients' }, ...initialClients]}
              />
            </div>

            <div>
              <label htmlFor="exceptionTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Exception type</label>
              <select
                id="exceptionTypeFilter"
                value={selectedExceptionType}
                onChange={(e) => setSelectedExceptionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All types</option>
                <option value="Authentication">Authentication</option>
                <option value="Data Process">Data Process</option>
                <option value="Integration">Integration</option>
                <option value="Workflow Logic">Workflow Logic</option>
                <option value="Browser Automation">Browser Automation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="severityFilter" className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                id="severityFilter"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exceptions List */}
        <div className="bg-cardBackground shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Exceptions List</h2>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-500">
                Error loading exceptions. Please try again.
              </div>
            ) : paginatedData?.exceptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No exceptions found matching the selected filters.
              </div>
            ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exception ID
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client name
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exception type
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remedy
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData?.exceptions.map((exception: Exception) => {
                return (
                  <tr key={exception._id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exception.exceptionId}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(exception.createdAt)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exception.clientId?.companyName || 'Unknown'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exception.workflowId?.departmentId?.name || 'N/A'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exception.workflowId?.name || 'Unknown'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exception.exceptionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(exception.severity)}`}>
                        {exception.severity}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exception.remedy || 'N/A'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <select
                        value={exception.status}
                        onChange={(e) => {
                          updateExceptionStatus({
                            id: exception._id,
                            status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
                          });
                        }}
                        className={`text-xs px-2 py-1 rounded ${getStatusClass(exception.status)}`}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            )}
          </div>

          {/* Pagination */}
          {paginatedData && paginatedData.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to <span className="font-medium">
                  {Math.min(currentPage * pageSize, paginatedData.totalCount)}
                </span> of <span className="font-medium">{paginatedData.totalCount}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 border rounded-md bg-gray-100">
                  {currentPage} of {paginatedData.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginatedData.totalPages}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
