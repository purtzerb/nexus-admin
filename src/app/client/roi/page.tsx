'use client';

import React, { useState } from 'react';
import Header from '@/components/shared/PageHeader';
import { useClientWorkflows, IWorkflowData } from '@/hooks/useClientWorkflows';

// Define sort field types for workflows table
type WorkflowSortField = 'createdAt' | 'department' | 'name' | 'nodesCount' | 'executionsCount' |
  'exceptionsCount' | 'timeSaved' | 'moneySaved' | 'status';
type SortOrder = 'asc' | 'desc';

export default function ClientROIPage() {
  const { data: workflows, isLoading, error } = useClientWorkflows();
  const [sortBy, setSortBy] = useState<WorkflowSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time saved in hours
  const formatHours = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min`;
  };

  // Format money as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle sort toggle
  const handleSort = (field: WorkflowSortField) => {
    if (field === sortBy) {
      // Toggle order if already sorting by this field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get sort icon for column
  const getSortIcon = (field: WorkflowSortField) => {
    if (field !== sortBy) {
      return <span className="text-gray-300 ml-1">↓</span>;
    }

    return sortOrder === 'asc'
      ? <span className="text-black ml-1">↑</span>
      : <span className="text-black ml-1">↓</span>;
  };

  // Sort workflows based on current sort settings
  const sortedWorkflows = workflows ? [...workflows].sort((a, b) => {
    // Helper function to compare values of any type
    const compare = (valueA: any, valueB: any) => {
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    };

    // Special case for date strings
    if (sortBy === 'createdAt') {
      return compare(new Date(a.createdAt).getTime(), new Date(b.createdAt).getTime());
    }

    return compare(a[sortBy], b[sortBy]);
  }) : [];
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="ROI by Workflow" />
      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-buttonBorder">
              <thead>
                <tr className="text-left text-sm text-textSecondary">
                  <th
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    Create Date{getSortIcon('createdAt')}
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort('department')}
                  >
                    Department{getSortIcon('department')}
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Workflow Name{getSortIcon('name')}
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer"
                    onClick={() => handleSort('nodesCount')}
                  >
                    # of Nodes{getSortIcon('nodesCount')}
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer"
                    onClick={() => handleSort('executionsCount')}
                  >
                    # of Executions{getSortIcon('executionsCount')}
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer"
                    onClick={() => handleSort('exceptionsCount')}
                  >
                    # of Exceptions{getSortIcon('exceptionsCount')}
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer"
                    onClick={() => handleSort('timeSaved')}
                  >
                    Time Saved{getSortIcon('timeSaved')}
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer"
                    onClick={() => handleSort('moneySaved')}
                  >
                    $ Saved{getSortIcon('moneySaved')}
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    Status{getSortIcon('status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-buttonBorder">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      <p className="mt-2 text-textSecondary">Loading workflows...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-error">
                      <p>Error loading workflows. Please try again later.</p>
                    </td>
                  </tr>
                ) : sortedWorkflows && sortedWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-textSecondary text-center py-6">
                      No workflows found for your account.
                    </td>
                  </tr>
                ) : sortedWorkflows && sortedWorkflows.map((workflow: IWorkflowData) => (
                  <tr key={workflow._id} className="hover:bg-darkerBackground">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(workflow.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {workflow.department}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {workflow.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {workflow.nodesCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {workflow.executionsCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {workflow.exceptionsCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {formatHours(workflow.timeSaved)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {formatCurrency(workflow.moneySaved)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workflow.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
