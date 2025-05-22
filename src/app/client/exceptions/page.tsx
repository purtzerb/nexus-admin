'use client';

import React, { useState } from 'react';
import Header from '@/components/shared/PageHeader';
import { useWorkflowExceptions, IWorkflowExceptionData } from '@/hooks/useWorkflowExceptions';

// Helper function to format date for display
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper function to get severity badge
const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'LOW':
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          Low
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Medium
        </span>
      );
    case 'HIGH':
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
          High
        </span>
      );
    case 'CRITICAL':
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Critical
        </span>
      );
    default:
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {severity}
        </span>
      );
  }
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Open
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          In Progress
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Resolved
        </span>
      );
    case 'CLOSED':
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          Closed
        </span>
      );
    default:
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
};

export default function ClientExceptionsPage() {
  const [timeRange, setTimeRange] = useState('last7days');
  const {
    data,
    isLoading,
    error,
    pagination,
    filters,
    actions
  } = useWorkflowExceptions();

  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Exceptions" />

      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-textPrimary">Workflow Exceptions</h2>
            <div className="flex space-x-2">
              <select
                className="border border-buttonBorder rounded-md px-3 py-1 text-sm bg-white text-textPrimary"
                value={filters.workflowId}
                onChange={(e) => actions.handleWorkflowChange(e.target.value)}
              >
                <option value="all">All Workflows</option>
                {data?.workflows.map((workflow) => (
                  <option key={workflow._id} value={workflow._id}>
                    {workflow.name}
                  </option>
                ))}
              </select>
              <select
                className="border border-buttonBorder rounded-md px-3 py-1 text-sm bg-white text-textPrimary"
                value={filters.status}
                onChange={(e) => actions.handleStatusChange(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                className="border border-buttonBorder rounded-md px-3 py-1 text-sm bg-white text-textPrimary"
                value={filters.severity}
                onChange={(e) => actions.handleSeverityChange(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <select
                className="border border-buttonBorder rounded-md px-3 py-1 text-sm bg-white text-textPrimary"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="last90days">Last 90 days</option>
                <option value="alltime">All time</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-buttonBorder">
              <thead>
                <tr className="text-left text-sm text-textSecondary">
                  <th className="px-4 py-3">Exception ID</th>
                  <th className="px-4 py-3">Workflow</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-buttonBorder">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      <p className="mt-2 text-textSecondary">Loading exceptions...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-error">
                      <p>Error loading exceptions. Please try again later.</p>
                    </td>
                  </tr>
                ) : data?.exceptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-textSecondary text-center py-6">
                      No exceptions found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  data?.exceptions.map((exception: IWorkflowExceptionData) => {
                    // Find the workflow name
                    const workflow = data.workflows.find(w => w._id === exception.workflowId.toString());
                    const workflowName = workflow ? workflow.name : 'Unknown Workflow';

                    return (
                      <tr key={exception._id} className="hover:bg-darkerBackground">
                        <td className="px-4 py-3 text-sm font-medium text-primary">
                          {exception.exceptionId}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {workflowName}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {exception.exceptionType}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {getSeverityBadge(exception.severity)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatDateTime(exception.createdAt.toString())}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {getStatusBadge(exception.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {!isLoading && !error && data?.exceptions && data.exceptions.length > 0 && (
            <div className="flex justify-between items-center mt-4 px-4">
              <div className="text-sm text-textSecondary">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} exceptions
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => actions.handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 border border-buttonBorder rounded-md text-sm ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-darkerBackground'}`}
                >
                  Previous
                </button>
                <span className="px-3 py-1 border border-buttonBorder rounded-md text-sm bg-white">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => actions.handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-3 py-1 border border-buttonBorder rounded-md text-sm ${pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-darkerBackground'}`}
                >
                  Next
                </button>
                <select
                  value={pagination.limit}
                  onChange={(e) => actions.handleLimitChange(parseInt(e.target.value))}
                  className="px-3 py-1 border border-buttonBorder rounded-md text-sm bg-white"
                >
                  <option value="10">10 rows</option>
                  <option value="20">20 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
