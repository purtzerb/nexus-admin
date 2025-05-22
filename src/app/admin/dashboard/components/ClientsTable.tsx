'use client';

import React from 'react';
import { format } from 'date-fns';
import { ClientDashboardData, SortField, SortOrder, formatCurrency, formatTime } from '@/lib/db/dashboardService';

interface ClientsTableProps {
  clients: ClientDashboardData[];
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField, order: SortOrder) => void;
}

export default function ClientsTable({ clients, sortBy, sortOrder, onSort }: ClientsTableProps) {
  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      // Toggle order if already sorting by this field
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      onSort(field, 'desc');
    }
  };

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (field !== sortBy) {
      return <span className="text-gray-300 ml-1">↓</span>;
    }

    return sortOrder === 'asc'
      ? <span className="text-black ml-1">↑</span>
      : <span className="text-black ml-1">↓</span>;
  };

  // Empty state message
  if (clients.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No client data available for the selected time period.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('companyName')}
            >
              CLIENT{getSortIcon('companyName')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('contractStart')}
            >
              CONTRACT START{getSortIcon('contractStart')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('workflowCount')}
            >
              WORKFLOWS{getSortIcon('workflowCount')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('nodeCount')}
            >
              NODES{getSortIcon('nodeCount')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('executionCount')}
            >
              EXECUTIONS{getSortIcon('executionCount')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('exceptionCount')}
            >
              EXCEPTIONS{getSortIcon('exceptionCount')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('revenue')}
            >
              REVENUE{getSortIcon('revenue')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('timeSaved')}
            >
              TIME SAVED{getSortIcon('timeSaved')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('moneySaved')}
            >
              MONEY SAVED{getSortIcon('moneySaved')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {client.companyName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.contractStart
                  ? format(new Date(client.contractStart), 'MMM d, yyyy')
                  : 'Jan 1, 2025'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.workflowCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.nodeCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.executionCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.exceptionCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(client.revenue)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatTime(client.timeSaved)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(client.moneySaved)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
