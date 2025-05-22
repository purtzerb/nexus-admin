'use client';

import React, { useState } from 'react';
import Header from '@/components/shared/PageHeader';
import { useWorkflowExecutions, IWorkflowExecutionData } from '@/hooks/useWorkflowExecutions';

// Helper function to format date for display
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Helper function to format duration in milliseconds
const formatDuration = (durationMs: number) => {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
};

export default function ClientReportingPage() {
  const [timeRange, setTimeRange] = useState('last7days');
  const {
    data,
    isLoading,
    error,
    pagination,
    filters,
    actions
  } = useWorkflowExecutions();
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Reporting" />
      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-textPrimary">Workflow Execution Logs</h2>
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
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Workflow</th>
                  <th className="px-4 py-3">Execution Details</th>
                  <th className="px-4 py-3 text-center">Duration</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-buttonBorder">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      <p className="mt-2 text-textSecondary">Loading execution logs...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-error">
                      <p>Error loading execution logs. Please try again later.</p>
                    </td>
                  </tr>
                ) : (!data?.executions || data.executions.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="text-textSecondary text-center py-6">
                      No execution logs found for the selected workflow.
                    </td>
                  </tr>
                ) : (
                  data?.executions.map((execution: IWorkflowExecutionData) => {
                    // Find the workflow name
                    const workflow = data.workflows.find(w => w._id === execution.workflowId);
                    const workflowName = workflow ? workflow.name : 'Unknown Workflow';

                    return (
                      <tr key={execution._id} className="hover:bg-darkerBackground">
                        <td className="px-4 py-3 text-sm">
                          {formatDateTime(execution.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {workflowName}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {execution.details}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {formatDuration(execution.duration)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            execution.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {execution.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {!isLoading && !error && data?.executions && data.executions.length > 0 && (
            <div className="flex justify-between items-center mt-4 px-4">
              <div className="text-sm text-textSecondary">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} executions
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
