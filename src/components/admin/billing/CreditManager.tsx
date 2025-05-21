'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/toast/toastUtils';
import { TextInput } from '@/components/shared/inputs';
import SearchableSelect, { Option } from '@/components/shared/inputs/SearchableSelect';

interface Client {
  _id: string;
  companyName: string;
  creditBalance?: number;
  lastCreditUpdate?: string;
}

interface PaginatedResponse {
  clients: Client[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// Fetch clients with credit information with pagination and search
const fetchClientsWithCredits = async ({
  page = 1,
  limit = 10,
  search = ''
}: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  queryParams.append('includeCredits', 'true');
  
  // Only append search param if it's not empty
  if (search && search.trim()) {
    queryParams.append('search', search.trim());
  }

  const url = `/api/admin/clients?${queryParams}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  const data = await response.json();
  
  return {
    clients: data.clients || [],
    totalCount: data.totalCount || 0,
    page: data.page || 1,
    totalPages: data.totalPages || 0
  };
};

// Format currency helper function
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Fetch clients function for React Query
const fetchClients = async (query: string): Promise<Client[]> => {
  // Construct query parameters
  const params = new URLSearchParams();
  if (query.trim()) {
    params.append('search', query.trim());
  }
  params.append('limit', '10'); // Limit to 10 results

  // Call the search API endpoint
  const response = await fetch(`/api/admin/clients?${params}`);

  if (!response.ok) {
    throw new Error('Failed to search clients');
  }

  const data = await response.json();
  return data.clients || [];
};

const CreditManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditNotes, setCreditNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Client search state
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [debouncedClientSearchTerm, setDebouncedClientSearchTerm] = useState('');
  
  // Pagination and search state for client list
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search term for client list
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Debounce search term for client selection
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedClientSearchTerm(clientSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearchTerm]);

  // Fetch clients for search dropdown using React Query
  const {
    data: clientOptions,
    isLoading: isLoadingClientOptions
  } = useQuery({
    queryKey: ['clientSearch', debouncedClientSearchTerm],
    queryFn: () => fetchClients(debouncedClientSearchTerm),
    enabled: !!debouncedClientSearchTerm,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (clients) => clients.map((client) => ({
      value: client._id,
      label: `${client.companyName} ${client.creditBalance !== undefined ? `(${formatCurrency(client.creditBalance)})` : ''}`
    }))
  });

  // Fetch clients with credit information for the table
  const {
    data: paginatedData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['clientsWithCredits', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => fetchClientsWithCredits({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchTerm
    }),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Ensure the query is refetched when the search term changes
    refetchOnReconnect: true
  });

  const clients = paginatedData?.clients || [];
  const totalPages = paginatedData?.totalPages || 0;
  const totalCount = paginatedData?.totalCount || 0;

  // formatCurrency is already defined at the module level

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedClientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0) {
      newErrors.creditAmount = 'Credit amount must be a positive number';
    }

    if (!creditReason.trim()) {
      newErrors.creditReason = 'Reason for credit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCredit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/clients/${selectedClientId}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(creditAmount),
          reason: creditReason,
          notes: creditNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply credit');
      }
      
      // Get the updated client data from the response
      const updatedData = await response.json();
      
      // Update the React Query cache for both queries
      queryClient.invalidateQueries({ queryKey: ['clientSearch'] });
      
      // If we have the specific client in the cache, update it directly
      if (updatedData.client) {
        // Update the client in the paginated data cache
        queryClient.setQueryData(['clientsWithCredits', currentPage, pageSize, debouncedSearchTerm], (oldData: any) => {
          if (!oldData) return oldData;
          
          // Find and update the client in the list
          const updatedClients = oldData.clients.map((client: Client) => 
            client._id === updatedData.client._id ? updatedData.client : client
          );
          
          return {
            ...oldData,
            clients: updatedClients
          };
        });
      }

      showToast('Credit applied successfully!', 'success');
      setSelectedClientId('');
      setCreditAmount('');
      setCreditReason('');
      setCreditNotes('');
      
      // Refetch to ensure we have the latest data
      refetch();
    } catch (error) {
      console.error('Error applying credit:', error);
      showToast(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isError) {
    return <div className="text-center py-8 text-error">Error loading client credit information. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Client Credits</h2>
        <p className="text-textSecondary mt-1">Apply credits to client accounts for adjustments, refunds, or promotional offers.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-buttonBorder">
        <h3 className="text-lg font-medium mb-4">Apply New Credit</h3>
        <form onSubmit={handleApplyCredit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="clientSearch" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <SearchableSelect
                value={selectedClientId}
                onChange={setSelectedClientId}
                onSearch={async (query) => {
                  setClientSearchTerm(query);
                  return clientOptions || [];
                }}
                placeholder="Search for a client..."
                emptyMessage={isLoadingClientOptions ? "Loading..." : "No clients found"}
                className={errors.clientId ? 'border-red-500' : ''}
                debounceMs={300}
              />
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
              )}
            </div>
            <div>
              <TextInput
                id="creditAmount"
                label="Credit Amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                type="number"
                required
                error={errors.creditAmount}
                leftIcon={<span className="text-gray-500">$</span>}
              />
            </div>
            <div>
              <TextInput
                id="creditReason"
                label="Reason for Credit"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                required
                error={errors.creditReason}
                placeholder="e.g., Service adjustment, Promotional offer"
              />
            </div>
            <div>
              <TextInput
                id="creditNotes"
                label="Notes (Optional)"
                value={creditNotes}
                onChange={(e) => setCreditNotes(e.target.value)}
                placeholder="Additional details about this credit"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors duration-200"
            >
              {isSubmitting ? 'Applying...' : 'Apply Credit'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-buttonBorder overflow-hidden">
        <h3 className="text-lg font-medium p-4 border-b border-buttonBorder">Client Credit Balances</h3>

        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border-b border-buttonBorder">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by client name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-buttonPrimary focus:border-buttonPrimary sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-sm text-gray-600">Show</span>
            <select
              className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-buttonPrimary focus:border-buttonPrimary"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-buttonBorder">
            <thead className="bg-darkerBackground">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                  Credit Balance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-buttonBorder">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-textSecondary">
                    <div className="flex justify-center items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading client credit information...</span>
                    </div>
                  </td>
                </tr>
              ) : clients && clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-textPrimary">{client.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-textPrimary">{formatCurrency(client.creditBalance)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-textSecondary">
                        {client.lastCreditUpdate ? new Date(client.lastCreditUpdate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-textSecondary">
                    No client credit information available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-buttonBorder bg-white px-4 py-3">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{clients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum ? 'z-10 bg-buttonPrimary text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buttonPrimary' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditManager;
